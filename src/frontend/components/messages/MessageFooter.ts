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
} from 'react-native';
import {h} from '@cycle/react';
import EmojiPicker from 'react-native-emoji-picker-staltz';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Msg, FeedId, PostContent, MsgId} from 'ssb-typescript';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {
  Reactions as ReactionsType,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '../../ssb/types';

const THUMBS_UP_UNICODE = '\ud83d\udc4d';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

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

  emojiPickerModal: {
    flex: 1,
  },

  emojiPickerBackground: {
    backgroundColor: Palette.transparencyDark,
  },

  emojiPickerContainer: {
    backgroundColor: Palette.backgroundText,
    padding: 0,
  },

  emojiPickerScroll: {
    paddingTop: Dimensions.verticalSpaceTiny,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
  },

  emojiPickerHeader: {
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

    const touchableProps: any = {
      onPress,
      accessible: true,
      accessibilityLabel: 'Reactions Button',
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.SelectableBackground();
    }

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
      return h(Touchable, touchableProps, child);
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

    const touchableProps: any = {
      onPress: this.onPress,
      onLongPress: this.props.onLongPress,
      delayLongPress: 100,
      delayPressIn: 20,
      accessible: true,
      accessibilityLabel: 'Like Button',
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.SelectableBackground();
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.likeButton, pointerEvents: 'box-only'}, [
        myReaction === null
          ? h(Icon, iconProps[ilike + 'Liked'])
          : h(Text, {key: 'm', style: styles.myReaction}, myReaction),
        h(Text, {key: 't', style: styles.likeButtonLabel}, 'Like'),
      ]),
    ]);
  }
}

class ReplyButton extends PureComponent<{onPress: () => void}> {
  public render() {
    const touchableProps: any = {
      onPress: this.props.onPress,
      accessible: true,
      accessibilityLabel: 'Reply Button',
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.SelectableBackground();
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.replyButton, pointerEvents: 'box-only'}, [
        h(Icon, iconProps.reply),
        h(Text, {key: 't', style: styles.replyButtonLabel}, 'Comment'),
      ]),
    ]);
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
  showEmojis: boolean;
};

export default class MessageFooter extends Component<Props, State> {
  public state = {showEmojis: false};

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
    this.setState(prev => ({showEmojis: !prev.showEmojis}));
  };

  private closeEmojiPicker = () => {
    this.setState({showEmojis: false});
  };

  private onSelectEmojiReaction = (emoji: string | null) => {
    if (emoji) {
      this.props.onPressAddReaction?.({
        msgKey: this.props.msg.key,
        value: 1,
        reaction: emoji,
      });
    }
    this.setState({showEmojis: false});
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
    if (nextS.showEmojis !== prevS.showEmojis) {
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

  private renderEmojiPickerModal() {
    return h(
      Modal,
      {
        animationType: 'none',
        transparent: true,
        hardwareAccelerated: true,
        visible: this.state.showEmojis,
        onRequestClose: this.closeEmojiPicker,
      },
      [
        h(EmojiPicker, {
          onEmojiSelected: this.onSelectEmojiReaction,
          onPressOutside: this.closeEmojiPicker,
          rows: 6,
          hideClearButton: true,
          localizedCategories: [
            'Smileys and emotion',
            'People and body',
            'Animals and nature',
            'Food and drink',
            'Activities',
            'Travel and places',
            'Objects',
            'Symbols',
          ],
          modalStyle: styles.emojiPickerModal,
          backgroundStyle: styles.emojiPickerBackground,
          containerStyle: styles.emojiPickerContainer,
          scrollStyle: styles.emojiPickerScroll,
          headerStyle: styles.emojiPickerHeader,
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
      this.renderEmojiPickerModal(),

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
