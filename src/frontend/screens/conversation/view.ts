// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
  SystemMessage as SystemMessageWithWrongTypes,
  SystemMessageProps,
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
import {globalStyles} from '../../global-styles/styles';

const GiftedChat = GiftedChatWithWrongTypes as any as ComponentClass<
  GiftedChatProps<GiftedMsg>
>;
const Bubble = BubbleWithWrongTypes as any as ComponentClass<
  BubbleProps<GiftedMsg>
>;
const Day = DayWithWrongTypes as any as ComponentClass<DayProps<GiftedMsg>>;
const InputToolbar =
  InputToolbarWithWrongTypes as any as ComponentClass<InputToolbarProps>;
const Composer = ComposerWithWrongTypes as any as ComponentClass<ComposerProps>;
const Message = MessageWithWrongTypes as any as ComponentClass<
  MessageProps<any>
>;
const SystemMessage = SystemMessageWithWrongTypes as any as ComponentClass<
  SystemMessageProps<any>
>;

export const styles = StyleSheet.create({
  container: globalStyles.containerWithDesktopSideBar,

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
    ...Platform.select({
      web: {
        width: Dimensions.iconSizeNormal,
        height: Dimensions.iconSizeNormal,
      },
    }),
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
        width: Dimensions.desktopMiddleWidth.px,
        maxWidth: Dimensions.desktopMiddleWidth.px,
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

  sysMessageContainer: {
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  messageLeftOrRight: {
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
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
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
});

interface SSBGiftedMsg extends GiftedMsg {
  mentions?: Array<any>;
}

function toGiftedMessage(msg: MsgAndExtras<PostContent>): SSBGiftedMsg {
  return {
    _id: msg.key,
    createdAt: msg.value.timestamp,
    text: msg.value.content.text,
    mentions: msg.value.content.mentions,
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
  return h(Send as any, {...props, containerStyle: null}, [
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
    containerStyle: styles.dayContainer,
    textStyle: styles.dayText,
  });
}

function renderSystemMessage(props: any) {
  return h(SystemMessage, {
    ...props,
    containerStyle: styles.sysMessageContainer,
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
      const realMessages: Array<SSBGiftedMsg> =
        state.thread.messages.map(toGiftedMessage);

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
          renderSystemMessage,
          renderInputToolbar,
          renderMessageText: (item: {currentMessage: SSBGiftedMsg}) =>
            h(View, {style: styles.bubbleText}, [
              item.currentMessage.user._id !== state.selfFeedId
                ? renderMessageAuthor(item.currentMessage.user)
                : null,
              h(Markdown, {
                text: item.currentMessage.text,
                mentions: item.currentMessage.mentions,
              }),
            ]),
        }),
      ]);
    });
}
