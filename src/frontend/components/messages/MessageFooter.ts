/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component, PureComponent, Fragment} from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import {h} from '@cycle/react';
import EmojiPicker from 'react-native-emoji-picker-staltz';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Msg, FeedId} from 'ssb-typescript';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {
  Reactions as ReactionsType,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '../../ssb/types';

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const HEART_UNICODE = '\u2665';
const SMILING_FACE_UNICODE = '\ud83d\ude0a';
const CRYING_FACE_UNICODE = '\ud83d\ude22';
const SMILING_GRINNING_UNICODE = '\ud83d\ude04';
const THINKING_FACE_UNICODE = '\ud83e\udd14';
const SURPRISED_UNICODE = '\ud83d\ude2e';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const touchableProps =
  Platform.OS === 'android'
    ? {
        background: TouchableNativeFeedback.SelectableBackground(),
      }
    : {};

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },

  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flex: 2,
  },

  buttonsContainer: {
    borderTopWidth: 1,
    borderTopColor: Palette.textLine,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flex: 3,
  },

  quickEmojiPickerModal: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    flex: 1,
  },

  quickEmojiPickerBackground: {
    backgroundColor: Palette.transparencyDark,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },

  quickEmojiPickerContainer: {
    backgroundColor: Palette.backgroundText,
    borderRadius: 10,
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    marginVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceNormal,
    flexDirection: 'column',
  },

  quickEmojiPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        height: 60,
      },
    }),
  },

  quickEmojiChoice: {
    flex: 1,
    fontSize: 30,
    padding: 15,
  },

  fullEmojiPickerModal: {
    flex: 1,
  },

  fullEmojiPickerBackground: {
    backgroundColor: Palette.transparencyDark,
  },

  fullEmojiPickerContainer: {
    backgroundColor: Palette.backgroundText,
    padding: 0,
  },

  fullEmojiPickerScroll: {
    paddingTop: Dimensions.verticalSpaceTiny,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
  },

  fullEmojiPickerHeader: {
    fontSize: Typography.fontSizeSmall,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  reactions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },

  reactionsText: {
    minWidth: 60,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    fontSize: Typography.fontSizeSmall,
    textAlignVertical: 'center',
    textAlign: 'left',
    color: Palette.textWeak,
  },

  repliesCounter: {
    marginRight: Dimensions.horizontalSpaceTiny,
    fontFamily: Typography.fontFamilyReadableText,
    fontSize: Typography.fontSizeNormal,
    textAlignVertical: 'center',
    textAlign: 'right',
    color: Palette.textWeak,
  },

  myReaction: {
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.fontSizeBig * 1.15,
  },

  prominentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        paddingHorizontal: Dimensions.horizontalSpaceNormal,
        marginHorizontal: -Dimensions.horizontalSpaceNormal,
      },
    }),
  },
});

class Reactions extends PureComponent<{
  onPress: () => void;
  reactions: NonNullable<ReactionsType>;
}> {
  public render() {
    const {reactions, onPress} = this.props;
    const count = reactions.length;
    const summary = reactions.map(([_feed, reaction]) => reaction).join('');

    const child = [
      h(View, {style: styles.reactions, pointerEvents: 'box-only'}, [
        h(
          Text,
          {
            style: styles.reactionsText,
            numberOfLines: 1,
            ellipsizeMode: 'tail',
          },
          count > 0 ? summary : ' ',
        ),
      ]),
    ];

    if (count > 0) {
      return h(
        Touchable,
        {
          ...touchableProps,
          onPress,
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: t(
            'message.call_to_action.show_reactions.accessibility_label',
          ),
        },
        child,
      );
    } else {
      return h(Fragment, child);
    }
  }
}

class AddReactionButton extends PureComponent<{
  onPress: () => void;
  myReaction: string | null;
}> {
  public render() {
    const {myReaction} = this.props;

    return h(
      Touchable,
      {
        ...touchableProps,
        onPress: this.props.onPress,
        delayLongPress: 100,
        delayPressIn: 20,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'message.call_to_action.add_reaction.accessibility_label',
        ),
      },
      [
        h(View, {style: styles.prominentButton, pointerEvents: 'box-only'}, [
          myReaction === null
            ? h(Icon, {
                key: 'icon',
                size: Dimensions.iconSizeSmall,
                color: Palette.textWeak,
                name: 'emoticon-happy-outline',
              })
            : h(Text, {key: 'm', style: styles.myReaction}, myReaction),
        ]),
      ],
    );
  }
}

class ReplyButton extends PureComponent<{
  onPress?: () => void;
  enabled: boolean;
  replyCount: number;
}> {
  public render() {
    const {replyCount, enabled} = this.props;

    if (enabled) {
      return h(
        Touchable,
        {
          ...touchableProps,
          onPress: this.props.onPress,
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: t(
            'message.call_to_action.reply.accessibility_label',
          ),
        },
        [
          h(View, {style: styles.prominentButton, pointerEvents: 'box-only'}, [
            replyCount > 0
              ? h(
                  Text,
                  {
                    key: 't',
                    style: styles.repliesCounter,
                    numberOfLines: 1,
                  },
                  String(replyCount),
                )
              : null,
            h(Icon, {
              key: 'icon',
              size: Dimensions.iconSizeSmall,
              color: Palette.textWeak,
              name: 'comment-outline',
            }),
          ]),
        ],
      );
    } else {
      return h(View, {style: styles.prominentButton}, [
        h(Icon, {
          key: 'icon',
          size: Dimensions.iconSizeSmall,
          color: Palette.textVeryWeak,
          name: 'comment-outline',
        }),
      ]);
    }
  }
}

class EtcButton extends PureComponent<{onPress: () => void}> {
  public render() {
    return h(
      Touchable,
      {
        ...touchableProps,
        onPress: this.props.onPress,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t('message.call_to_action.etc.accessibility_label'),
      },
      [
        h(View, {style: styles.prominentButton, pointerEvents: 'box-only'}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            color: Palette.textWeak,
            name: 'dots-horizontal',
          }),
        ]),
      ],
    );
  }
}

export type Props = {
  msg: Msg;
  selfFeedId: FeedId;
  reactions: ReactionsType;
  replyCount: number;
  style?: ViewStyle;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReply?: () => void;
  onPressEtc?: (msg: Msg) => void;
};
export type State = {
  showQuickEmojis: boolean;
  showFullEmojis: boolean;
};

export default class MessageFooter extends Component<Props, State> {
  public state = {
    showQuickEmojis: false,
    showFullEmojis: false,
  };

  /**
   * in pixels
   */
  public static HEIGHT = 75;

  private myReaction: string | null = null;

  private onPressReactionsHandler = () => {
    this.props.onPressReactions?.({
      msgKey: this.props.msg.key,
      reactions: this.props.reactions,
    });
  };

  private onPressAddReactionHandler = () => {
    if (this.myReaction === null) {
      this.setState(prev => ({showQuickEmojis: !prev.showQuickEmojis}));
    } else {
      this.props.onPressAddReaction?.({
        msgKey: this.props.msg.key,
        value: 0,
        reaction: null,
      });
    }
  };

  private closeQuickEmojiPicker = () => {
    this.setState({showQuickEmojis: false});
  };

  private openFullEmojiPicker = () => {
    this.setState({showQuickEmojis: false, showFullEmojis: true});
  };

  private closeFullEmojiPicker = () => {
    this.setState({showQuickEmojis: false, showFullEmojis: false});
  };

  private onSelectEmojiReaction = (emoji: string | null) => {
    if (emoji) {
      this.props.onPressAddReaction?.({
        msgKey: this.props.msg.key,
        value: 1,
        reaction: emoji,
      });
    }
    this.setState({showQuickEmojis: false, showFullEmojis: false});
  };

  private onPressEtcHandler = () => {
    this.props.onPressEtc?.(this.props.msg);
  };

  private findMyLatestReaction(): string | null {
    const reactions = this.props.reactions;
    if (!reactions) return null;
    const selfFeedId = this.props.selfFeedId;
    for (let i = reactions.length - 1; i >= 0; i--) {
      if (reactions[i][0] === selfFeedId) {
        return reactions[i][1];
      }
    }
    return null;
  }

  public shouldComponentUpdate(nextP: Props, nextS: State) {
    const prevP = this.props;
    const prevS = this.state;
    if (nextP.msg.key !== prevP.msg.key) return true;
    if (nextS.showQuickEmojis !== prevS.showQuickEmojis) return true;
    if (nextS.showFullEmojis !== prevS.showFullEmojis) return true;
    if (nextP.onPressReply !== prevP.onPressReply) return true;
    if (nextP.replyCount !== prevP.replyCount) return true;
    if ((nextP.reactions ?? []).length !== (prevP.reactions ?? []).length) {
      return true;
    }
    if (
      // Check that the latest (the first entry) is
      // from the same author but has changed the emoji
      nextP.reactions &&
      prevP.reactions &&
      nextP.reactions.length > 0 &&
      prevP.reactions.length > 0 &&
      nextP.reactions[0][0] === prevP.reactions[0][0] &&
      nextP.reactions[0][1] !== prevP.reactions[0][1]
    ) {
      return true;
    }
    // Deep comparison
    if (JSON.stringify(nextP.reactions) !== JSON.stringify(prevP.reactions)) {
      return true;
    }

    return false;
  }

  private renderQuickEmojiChoice(emoji: string) {
    return h(
      Touchable,
      {
        ...touchableProps,
        onPress: () => this.onSelectEmojiReaction(emoji),
        accessible: true,
        accessibilityRole: 'button',
      },
      [h(Text, {style: styles.quickEmojiChoice}, emoji)],
    );
  }

  private renderShowAllEmojisChoice() {
    return h(
      Touchable,
      {
        ...touchableProps,
        onPress: this.openFullEmojiPicker,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'message.reactions.show_more.accessibility_label',
        ),
      },
      [
        h(Icon, {
          style: styles.quickEmojiChoice,
          key: 'showall',
          color: Palette.textWeak,
          name: 'dots-horizontal',
        }),
      ],
    );
  }

  private renderQuickEmojiPickerModal() {
    return h(
      Modal,
      {
        animationType: 'none',
        transparent: true,
        hardwareAccelerated: true,
        visible: this.state.showQuickEmojis,
        onRequestClose: this.closeQuickEmojiPicker,
      },
      [
        h(View, {style: styles.quickEmojiPickerModal}, [
          h(View, {style: styles.quickEmojiPickerContainer}, [
            h(View, {style: styles.quickEmojiPickerRow}, [
              this.renderQuickEmojiChoice(THUMBS_UP_UNICODE),
              this.renderQuickEmojiChoice(HEART_UNICODE),
              this.renderQuickEmojiChoice(SMILING_FACE_UNICODE),
              this.renderQuickEmojiChoice(CRYING_FACE_UNICODE),
            ]),
            h(View, {style: styles.quickEmojiPickerRow}, [
              this.renderQuickEmojiChoice(SMILING_GRINNING_UNICODE),
              this.renderQuickEmojiChoice(THINKING_FACE_UNICODE),
              this.renderQuickEmojiChoice(SURPRISED_UNICODE),
              this.renderShowAllEmojisChoice(),
            ]),
          ]),
          h(TouchableWithoutFeedback, {onPress: this.closeQuickEmojiPicker}, [
            h(View, {style: styles.quickEmojiPickerBackground}),
          ]),
        ]),
      ],
    );
  }

  private renderFullEmojiPickerModal() {
    if (!this.state.showQuickEmojis && !this.state.showFullEmojis) return null;

    return h(
      Modal,
      {
        animationType: 'none',
        transparent: true,
        hardwareAccelerated: true,
        visible: this.state.showFullEmojis,
        onRequestClose: this.closeFullEmojiPicker,
      },
      [
        h(EmojiPicker, {
          onEmojiSelected: this.onSelectEmojiReaction,
          onPressOutside: this.closeFullEmojiPicker,
          rows: 6,
          hideClearButton: true,
          localizedCategories: [
            t('message.reactions.categories.smileys_and_emotion'),
            t('message.reactions.categories.people_and_body'),
            t('message.reactions.categories.animals_and_nature'),
            t('message.reactions.categories.food_and_drink'),
            t('message.reactions.categories.activities'),
            t('message.reactions.categories.travel_and_places'),
            t('message.reactions.categories.objects'),
            t('message.reactions.categories.symbols'),
          ],
          modalStyle: styles.fullEmojiPickerModal,
          backgroundStyle: styles.fullEmojiPickerBackground,
          containerStyle: styles.fullEmojiPickerContainer,
          scrollStyle: styles.fullEmojiPickerScroll,
          headerStyle: styles.fullEmojiPickerHeader,
        }),
      ],
    );
  }

  public render() {
    const props = this.props;
    const shouldShowReply = !!props.onPressReply;
    const reactions = props.reactions ?? [];
    const replyCount = props.replyCount;
    this.myReaction = this.findMyLatestReaction();

    return h(View, {style: [styles.container, props.style]}, [
      this.renderQuickEmojiPickerModal(),
      this.renderFullEmojiPickerModal(),

      h(View, {key: 'summary', style: styles.reactionsContainer}, [
        h(Reactions, {reactions, onPress: this.onPressReactionsHandler}),
      ]),

      h(View, {key: 'buttons', style: styles.buttonsContainer}, [
        h(AddReactionButton, {
          key: 'react',
          onPress: this.onPressAddReactionHandler,
          myReaction: this.myReaction,
        }),

        h(ReplyButton, {
          key: 'reply',
          replyCount,
          enabled: shouldShowReply,
          onPress: props.onPressReply,
        }),

        h(EtcButton, {key: 'etc', onPress: this.onPressEtcHandler}),
      ]),
    ]);
  }
}
