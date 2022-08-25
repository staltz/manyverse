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
  InputToolbar as InputToolbarWithWrongTypes,
  Message as MessageWithWrongTypes,
  SystemMessage as SystemMessageWithWrongTypes,
  LoadEarlier as LoadEarlierWithWrongTypes,
  SystemMessageProps,
  IMessage as GiftedMsg,
  GiftedChatProps,
  BubbleProps,
  DayProps,
  InputToolbarProps,
  LoadEarlierProps,
  MessageProps,
  Send,
} from 'react-native-gifted-chat';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';
import {IconNames} from '~frontend/global-styles/icons';
import Markdown from '~frontend/components/Markdown';
import Avatar from '~frontend/components/Avatar';
import TopBar from '~frontend/components/TopBar';
import HeaderButton from '~frontend/components/HeaderButton';
import LocalizedHumanTime from '~frontend/components/LocalizedHumanTime';
import {displayName} from '~frontend/ssb/utils/from-ssb';
import {SSBGiftedMsg, State} from '../model';
import {SettableComposer} from './SettableComposer';

const GiftedChat = GiftedChatWithWrongTypes as any as ComponentClass<
  GiftedChatProps<GiftedMsg>
>;
const Bubble = BubbleWithWrongTypes as any as ComponentClass<
  BubbleProps<GiftedMsg>
>;
const Day = DayWithWrongTypes as any as ComponentClass<DayProps<GiftedMsg>>;
const InputToolbar =
  InputToolbarWithWrongTypes as any as ComponentClass<InputToolbarProps>;
const Message = MessageWithWrongTypes as any as ComponentClass<
  MessageProps<any>
>;
const SystemMessage = SystemMessageWithWrongTypes as any as ComponentClass<
  SystemMessageProps<any>
>;
const LoadEarlier =
  LoadEarlierWithWrongTypes as any as ComponentClass<LoadEarlierProps>;

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

  loadEarlierContainer: {
    marginTop: Dimensions.verticalSpaceLarge,
    marginBottom: Dimensions.verticalSpaceNormal,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  /**
   * Similar to src/frontend/components/Button.ts
   */
  loadEarlierButton: {
    borderRadius: 3,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceSmall,
    backgroundColor: 'transparent',
    borderColor: Palette.isDarkTheme ? Palette.textBrand : Palette.brandMain,
    borderWidth: 1,
    height: undefined,
  },

  loadEarlierText: {
    fontSize: Typography.fontSizeNormal,
    textAlign: 'center',
    color: Palette.textBrand,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
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
        name: IconNames.sendMessage,
      }),
    ]),
  ]);
}

function renderComposer(props: any, nativeProps$: Stream<Object>) {
  return h(SettableComposer, {
    ...props,
    nativeProps$: nativeProps$.take(1),
    sel: 'msg-composer',
    placeholder: t('conversation.placeholder'),
    textInputAutoFocus: true,
    placeholderTextColor: Palette.textVeryWeak,
    textInputStyle: styles.textInputStyle,
    textInputProps:
      Platform.OS === 'web'
        ? {
            blurOnSubmit: true,
            onSubmitEditing: () => {
              if (props.text && props.onSend) {
                props.onSend({text: props.text}, true);
              }
            },
          }
        : undefined,
  });
}

function renderInputToolbar(props: any, nativeProps$: Stream<Object>) {
  return h(InputToolbar, {
    ...props,
    containerStyle: styles.inputToolbarContainer,
    renderComposer: (props) => renderComposer(props, nativeProps$),
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

function renderLoadEarlier(props: any) {
  return h(LoadEarlier, {
    ...props,
    containerStyle: styles.loadEarlierContainer,
    wrapperStyle: styles.loadEarlierButton,
    textStyle: styles.loadEarlierText,
    label: t('conversation.load_more'),
  });
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

export default function view(
  state$: Stream<State>,
  draftMessage$: Stream<string>,
) {
  return state$
    .compose(
      dropRepeatsByKeys([
        'avatarUrl',
        'rootMsgId',
        'selfFeedId',
        (s) => s.giftedMessages.length,
      ]),
    )
    .map(({selfFeedId, giftedMessages, thread}) =>
      h(View, {style: styles.container}, [
        h(TopBar, {sel: 'topbar', title: t('conversation.title')}, [
          h(HeaderButton, {
            sel: 'showRecipients',
            icon: IconNames.listOfPeople,
            accessibilityLabel: t(
              'conversation.call_to_action.show_recipients.accessibility_label',
            ),
            side: 'right',
          }),
        ]),

        h(GiftedChat, {
          sel: 'chat',
          user: {_id: selfFeedId},
          inverted: true,
          messages: giftedMessages,
          loadEarlier: giftedMessages.length < thread.messages.length,
          infiniteScroll: true,
          listViewProps: {
            onEndReachedThreshold: 3,
          },
          renderMessage,
          renderFooter,
          renderBubble,
          renderAvatar,
          renderLoadEarlier,
          renderSend,
          renderTime,
          renderDay,
          renderSystemMessage,
          renderInputToolbar: (props) =>
            renderInputToolbar(
              props,
              draftMessage$.map((value) => ({value})),
            ),
          renderMessageText: (item: {currentMessage: SSBGiftedMsg}) =>
            h(View, {style: styles.bubbleText}, [
              item.currentMessage.user._id !== selfFeedId
                ? renderMessageAuthor(item.currentMessage.user)
                : null,
              h(Markdown, {
                text: item.currentMessage.text,
                mentions: item.currentMessage.mentions,
              }),
            ]),
        }),
      ]),
    );
}
