/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {ReactElement, ComponentClass} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  GiftedChat as GiftedChatWithWrongTypes,
  Bubble as BubbleWithWrongTypes,
  Day as DayWithWrongTypes,
  GiftedChatProps,
  BubbleProps,
  DayProps,
  IMessage as GiftedMsg,
  Send,
} from 'react-native-gifted-chat';
import HumanTime from 'react-human-time';
import {PostContent} from 'ssb-typescript';
import {MsgAndExtras} from '../../drivers/ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import {State} from './model';

const GiftedChat = (GiftedChatWithWrongTypes as any) as ComponentClass<
  GiftedChatProps<GiftedMsg>
>;
const Bubble = (BubbleWithWrongTypes as any) as ComponentClass<
  BubbleProps<GiftedMsg>
>;
const Day = (DayWithWrongTypes as any) as ComponentClass<DayProps<GiftedMsg>>;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },

  bubbleText: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
  },

  send: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    marginVertical: Dimensions.verticalSpaceNormal,
  },

  username: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    minWidth: 120,
  },

  time: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceTiny,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  footer: {
    paddingBottom: Dimensions.verticalSpaceSmall,
  },

  bubbleLeft: {
    backgroundColor: Palette.backgroundText,
    borderColor: Palette.backgroundVoidStrong,
    borderWidth: StyleSheet.hairlineWidth,
  },

  bubbleRight: {
    backgroundColor: Palette.backgroundBrandWeakest,
    borderColor: Palette.backgroundBrandWeaker,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

function statesAreEqual(s1: State, s2: State): boolean {
  if (s1.avatarUrl !== s2.avatarUrl) return false;
  if (s1.thread.messages.length !== s2.thread.messages.length) return false;
  if (s1.thread.full !== s2.thread.full) return false;
  if (s1.rootMsgId !== s2.rootMsgId) return false;
  if (s1.selfFeedId !== s2.selfFeedId) return false;
  return true;
}

function toGiftedMessage(msg: MsgAndExtras<PostContent>): GiftedMsg {
  return {
    _id: msg.key,
    createdAt: msg.timestamp,
    text: msg.value.content.text,
    user: {
      _id: msg.value.author,
      name: msg.value._$manyverse$metadata.about.name,
      avatar: msg.value._$manyverse$metadata.about.imageUrl ?? void 0,
    },
  };
}

function renderBubble(props: any) {
  return h(Bubble, {
    ...props,
    wrapperStyle: {
      left: styles.bubbleLeft,
      right: styles.bubbleRight,
    },
  });
}

function renderMessageAuthor(user: GiftedMsg['user']) {
  const color = Palette.colorHash(user._id as string);
  return h(Text, {style: [styles.username, {color}]}, user.name);
}

function renderFooter() {
  return h(View, {style: styles.footer});
}

function renderSend(props: any) {
  return h(Send as any, props, [
    h(View, {style: styles.send}, [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.textCTA,
        name: 'send',
      }),
    ]),
  ]);
}

/**
 * This constant is buried deep inside react-native-gifted-chat. It would be
 * good to import it directly, but for now we're just hard coding it. TODO
 */
const DEFAULT_GIFTED_AVATAR_SIZE = 40;

function renderAvatar(props: any) {
  const user = props.currentMessage.user;
  return h(
    TouchableOpacity,
    {activeOpacity: 0.5, onPress: () => props.onPressAvatar?.(user)},
    [
      h(Avatar, {
        size: DEFAULT_GIFTED_AVATAR_SIZE - 4, // TODO -4 is a hacky fix
        url: user.avatar,
      }),
    ],
  );
}

function renderTime(props: any) {
  return h(Text, {style: styles.time}, [
    h(HumanTime, {time: props.currentMessage.createdAt as number}),
  ]);
}

function renderDay(props: any) {
  return h(Day, {textStyle: styles.time, ...props});
}

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  const appStartTime = Date.now();
  return xs
    .combine(state$.compose(dropRepeats(statesAreEqual)), topBar$)
    .map(([state, topBarVDOM]) => {
      const sysMessages: Array<GiftedMsg> = state.emptyThreadSysMessage
        ? [
            {
              _id: 1,
              text: 'This is a new private conversation',
              createdAt: appStartTime,
              system: true,
            } as any,
          ]
        : [];
      const realMessages: Array<GiftedMsg> = state.thread.messages.map(
        toGiftedMessage,
      );

      return h(View, {style: styles.container}, [
        topBarVDOM,
        h(GiftedChat, {
          sel: 'chat',
          user: {_id: state.selfFeedId},
          inverted: false,
          messages: sysMessages.concat(realMessages),
          renderFooter,
          renderBubble,
          renderAvatar,
          renderSend,
          renderTime,
          renderDay,
          renderMessageText: (item: {currentMessage: GiftedMsg}) =>
            h(View, {style: styles.bubbleText}, [
              item.currentMessage.user._id !== state.selfFeedId
                ? renderMessageAuthor(item.currentMessage.user)
                : null,
              Markdown(item.currentMessage.text),
            ]),
        }),
      ]);
    });
}
