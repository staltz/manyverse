/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {ComponentClass} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Platform} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  GiftedChat as GiftedChatWithWrongTypes,
  Bubble as BubbleWithWrongTypes,
  Day as DayWithWrongTypes,
  Composer as ComposerWithWrongTypes,
  InputToolbar as InputToolbarWithWrongTypes,
  Message as MessageWithWrongTypes,
  IMessage as GiftedMsg,
  GiftedChatProps,
  BubbleProps,
  DayProps,
  ComposerProps,
  InputToolbarProps,
  MessageProps,
  Send,
} from 'react-native-gifted-chat';
import {PostContent} from 'ssb-typescript';
import {MsgAndExtras} from '../../ssb/types';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import TopBar from '../../components/TopBar';
import HeaderButton from '../../components/HeaderButton';
import LocalizedHumanTime from '../../components/LocalizedHumanTime';
import {State} from './model';
import {displayName} from '../../ssb/utils/from-ssb';

const GiftedChat = (GiftedChatWithWrongTypes as any) as ComponentClass<
  GiftedChatProps<GiftedMsg>
>;
const Bubble = (BubbleWithWrongTypes as any) as ComponentClass<
  BubbleProps<GiftedMsg>
>;
const Day = (DayWithWrongTypes as any) as ComponentClass<DayProps<GiftedMsg>>;
const InputToolbar = (InputToolbarWithWrongTypes as any) as ComponentClass<
  InputToolbarProps
>;
const Composer = (ComposerWithWrongTypes as any) as ComponentClass<
  ComposerProps
>;
const Message = (MessageWithWrongTypes as any) as ComponentClass<
  MessageProps<any>
>;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  bubbleText: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    ...Platform.select({
      web: {
        wordBreak: 'break-word',
      },
    }),
  },

  send: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    marginVertical: Dimensions.verticalSpaceNormal,
  },

  username: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    paddingTop: Dimensions.verticalSpaceTiny,
    minWidth: 120,
  },

  dayContainer: {
    marginTop: Dimensions.verticalSpaceBig,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  dayText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
  },

  timeText: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  footer: {
    paddingBottom: Dimensions.verticalSpaceSmall,
  },

  textInputStyle: {
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
  },

  bubbleLeft: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimensions.borderRadiusBig,
    borderWidth: 0,
    paddingHorizontal: Dimensions.verticalSpaceTiny,
    paddingTop: Dimensions.verticalSpaceTiny,
    paddingBottom: Dimensions.verticalSpaceNormal,
  },

  bubbleRight: {
    backgroundColor: Palette.isDarkTheme
      ? Palette.brandStrong
      : Palette.brandWeakest,
    borderRadius: Dimensions.borderRadiusBig,
    borderWidth: 0,
    paddingHorizontal: Dimensions.verticalSpaceTiny,
    paddingTop: Dimensions.verticalSpaceTiny,
    paddingBottom: Dimensions.verticalSpaceNormal,
  },

  messageLeftOrRight: {
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  inputToolbarContainer: {
    backgroundColor: Palette.backgroundText,
    // TODO: enable this but also avoid the borderTop on the Send component
    borderTopWidth: 0, // StyleSheet.hairlineWidth,
    borderTopColor: Palette.textLine,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },
});

function toGiftedMessage(msg: MsgAndExtras<PostContent>): GiftedMsg {
  return {
    _id: msg.key,
    createdAt: msg.value.timestamp,
    text: msg.value.content.text,
    user: {
      _id: msg.value.author,
      name: msg.value._$manyverse$metadata.about.name,
      avatar: msg.value._$manyverse$metadata.about.imageUrl ?? void 0,
    },
  };
}

function renderMessage(props: MessageProps<any>) {
  return h(Message, {
    ...props,
    containerStyle: {
      left: styles.messageLeftOrRight,
      right: styles.messageLeftOrRight,
    },
  });
}

function renderBubble(props: any) {
  const {previousMessage, currentMessage} = props;
  const marginTop =
    previousMessage?.user?._id === currentMessage.user._id
      ? 0
      : Dimensions.verticalSpaceBig;

  return h(Bubble, {
    ...props,
    wrapperStyle: {
      left: [styles.bubbleLeft, {marginTop}],
      right: [styles.bubbleRight, {marginTop}],
    },
  });
}

function renderMessageAuthor(user: GiftedMsg['user']) {
  const color = Palette.colorHash(user._id as string);
  return h(
    Text,
    {style: [styles.username, {color}]},
    displayName(user.name, String(user._id)),
  );
}

function renderFooter() {
  return h(View, {style: styles.footer});
}

function renderSend(props: any) {
  return h(Send as any, {...props, style: null}, [
    h(View, {style: styles.send}, [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.textCTA,
        name: 'send',
      }),
    ]),
  ]);
}

function renderComposer(props: any) {
  return h(Composer, {
    ...props,
    placeholder: t('conversation.placeholder'),
    placeholderTextColor: Palette.textVeryWeak,
    textInputStyle: styles.textInputStyle,
  });
}

function renderInputToolbar(props: any) {
  return h(InputToolbar, {
    ...props,
    containerStyle: styles.inputToolbarContainer,
    renderComposer,
  });
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
  return h(Text, {style: styles.timeText}, [
    h(LocalizedHumanTime, {time: props.currentMessage.createdAt as number}),
  ]);
}

function renderDay(props: any) {
  return h(Day, {
    ...props,
    containerStyle: [styles.dayContainer],
    textStyle: [styles.dayText],
  });
}

export default function view(state$: Stream<State>) {
  const appStartTime = Date.now();
  return state$
    .compose(
      dropRepeatsByKeys([
        'avatarUrl',
        'rootMsgId',
        'selfFeedId',
        (s) => s.thread.messages.length,
        (s) => s.thread.full,
      ]),
    )
    .map((state) => {
      const sysMessages: Array<GiftedMsg> = state.emptyThreadSysMessage
        ? [
            {
              _id: 1,
              text: t('conversation.notifications.new_conversation'),
              createdAt: appStartTime,
              system: true,
            } as any,
          ]
        : [];
      const realMessages: Array<GiftedMsg> = state.thread.messages.map(
        toGiftedMessage,
      );

      return h(View, {style: styles.container}, [
        h(TopBar, {sel: 'topbar', title: t('conversation.title')}, [
          h(HeaderButton, {
            sel: 'showRecipients',
            icon: 'account-multiple',
            accessibilityLabel: t(
              'conversation.call_to_action.show_recipients.accessibility_label',
            ),
            side: 'right',
          }),
        ]),
        h(GiftedChat, {
          sel: 'chat',
          user: {_id: state.selfFeedId},
          inverted: false,
          messages: sysMessages.concat(realMessages),
          renderMessage,
          renderFooter,
          renderBubble,
          renderAvatar,
          renderSend,
          renderTime,
          renderDay,
          renderInputToolbar,
          renderMessageText: (item: {currentMessage: GiftedMsg}) =>
            h(View, {style: styles.bubbleText}, [
              item.currentMessage.user._id !== state.selfFeedId
                ? renderMessageAuthor(item.currentMessage.user)
                : null,
              h(Markdown, {text: item.currentMessage.text}),
            ]),
        }),
      ]);
    });
}
