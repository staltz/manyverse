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
} from 'react-native';
import {h} from '@cycle/react';
import EmojiPicker from 'react-native-emoji-picker-staltz';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Msg, FeedId, PostContent, MsgId} from 'ssb-typescript';
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
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  col: {
    flexDirection: 'column',
  },

  reactionsShown: {
    minWidth: 60,
    paddingTop: Dimensions.verticalSpaceSmall,
    paddingBottom: Dimensions.verticalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    letterSpacing: -3,
    fontWeight: 'bold',
  },

  reactionsHidden: {
    paddingTop: Dimensions.verticalSpaceSmall,
    paddingBottom: Dimensions.verticalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.backgroundText,
  },

  myReaction: {
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.fontSizeBig * 1.15,
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

  likeButton: {
    flexDirection: 'row',
    paddingTop: Dimensions.verticalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceBig,
    paddingLeft: 1,
    paddingRight: Dimensions.horizontalSpaceBig,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  likeButtonLabel: {
    fontSize: Typography.fontSizeSmall,
    fontWeight: 'bold',
    marginLeft: Dimensions.horizontalSpaceSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  replyButton: {
    flexDirection: 'row',
    paddingTop: Dimensions.verticalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceBig,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  replyButtonLabel: {
    fontSize: Typography.fontSizeSmall,
    fontWeight: 'bold',
    marginLeft: Dimensions.horizontalSpaceSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

const iconProps = {
  noLiked: {
    key: 'icon',
    size: Dimensions.iconSizeSmall,
    color: Palette.textWeak,
    name: 'thumb-up-outline',
  },
  maybeLiked: {
    key: 'icon',
    size: Dimensions.iconSizeSmall,
    color: Palette.foregroundNeutral,
    name: 'thumb-up',
  },
  yesLiked: {
    key: 'icon',
    size: Dimensions.iconSizeSmall,
    color: Palette.backgroundBrandWeak,
    name: 'thumb-up',
  },
  reply: {
    key: 'icon',
    size: Dimensions.iconSizeSmall,
    color: Palette.textWeak,
    name: 'comment-outline',
  },
};

class Reactions extends PureComponent<{
  onPress: () => void;
  reactions: NonNullable<ReactionsType>;
}> {
  public render() {
    const MAX = 10;
    const {reactions, onPress} = this.props;
    const count = reactions.length;
    const summary = reactions
      .slice(0, Math.min(count, MAX)) // take first `MAX` recent reactions
      .map(([_feed, reaction]) => reaction)
      .join('');

    const child = [
      h(View, {style: styles.col, pointerEvents: 'box-only'}, [
        h(
          Text,
          {style: count > 0 ? styles.reactionsShown : styles.reactionsHidden},
          ['\u2002', summary, '\u2002', count > MAX ? '\u2026' : ''],
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

class LikeButton extends PureComponent<
  {
    onPress: () => void;
    onLongPress: () => void;
    myReaction: string | null;
  },
  {maybeToggled: boolean}
> {
  public state = {maybeToggled: false};

  private onPress = () => {
    if (this.state.maybeToggled) return;

    this.setState({maybeToggled: true});
    this.props.onPress();
  };

  public render() {
    const {myReaction} = this.props;
    const {maybeToggled} = this.state;
    const ilike: 'no' | 'maybe' | 'yes' = maybeToggled
      ? 'maybe'
      : myReaction === null
      ? 'no'
      : 'yes';

    return h(
      Touchable,
      {
        ...touchableProps,
        onPress: this.onPress,
        onLongPress: this.props.onLongPress,
        delayLongPress: 100,
        delayPressIn: 20,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'message.call_to_action.add_reaction.accessibility_label',
        ),
      },
      [
        h(View, {style: styles.likeButton, pointerEvents: 'box-only'}, [
          myReaction === null
            ? h(Icon, iconProps[ilike + 'Liked'])
            : h(Text, {key: 'm', style: styles.myReaction}, myReaction),
          h(
            Text,
            {key: 't', style: styles.likeButtonLabel},
            t('message.call_to_action.add_reaction.label'),
          ),
        ]),
      ],
    );
  }
}

class ReplyButton extends PureComponent<{onPress: () => void}> {
  public render() {
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
        h(View, {style: styles.replyButton, pointerEvents: 'box-only'}, [
          h(Icon, iconProps.reply),
          h(
            Text,
            {key: 't', style: styles.replyButtonLabel},
            t('message.call_to_action.reply.label'),
          ),
        ]),
      ],
    );
  }
}

export type Props = {
  msg: Msg;
  selfFeedId: FeedId;
  reactions: ReactionsType;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
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

  private myReaction: string | null = null;

  private onPressReactionsHandler = () => {
    this.props.onPressReactions?.({
      msgKey: this.props.msg.key,
      reactions: this.props.reactions,
    });
  };

  private onPressAddReactionHandler = () => {
    this.props.onPressAddReaction?.({
      msgKey: this.props.msg.key,
      value: this.myReaction === null ? 1 : 0,
      reaction: this.myReaction === null ? THUMBS_UP_UNICODE : null,
    });
  };

  private onLongPressAddReactionHandler = () => {
    this.setState(prev => ({showQuickEmojis: !prev.showQuickEmojis}));
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

  private onPressReplyHandler = () => {
    const msg = this.props.msg;
    const msgKey = msg.key;
    const rootKey = (msg?.value?.content as PostContent)?.root ?? msgKey;
    this.props.onPressReply?.({msgKey, rootKey});
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
    if (nextP.msg.key !== prevP.msg.key) {
      return true;
    }
    if (nextS.showQuickEmojis !== prevS.showQuickEmojis) {
      return true;
    }
    if (nextS.showFullEmojis !== prevS.showFullEmojis) {
      return true;
    }
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
    const timestamp = Date.now();
    const props = this.props;
    const shouldShowReply = !!props.onPressReply;
    const reactions = props.reactions ?? [];
    this.myReaction = this.findMyLatestReaction();

    return h(View, {style: styles.col}, [
      this.renderQuickEmojiPickerModal(),
      this.renderFullEmojiPickerModal(),

      h(View, {key: 'summary', style: styles.row}, [
        h(Reactions, {reactions, onPress: this.onPressReactionsHandler}),
      ]),

      h(View, {key: 'button', style: styles.row}, [
        h(LikeButton, {
          onPress: this.onPressAddReactionHandler,
          onLongPress: this.onLongPressAddReactionHandler,
          myReaction: this.myReaction,
          key: timestamp,
        }),

        shouldShowReply
          ? h(ReplyButton, {key: 'reply', onPress: this.onPressReplyHandler})
          : null,
      ]),
    ]);
  }
}
