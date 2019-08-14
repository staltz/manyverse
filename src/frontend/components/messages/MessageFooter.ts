/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  StyleSheet,
  TouchableNativeFeedbackProperties,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Msg, FeedId, PostContent, MsgId} from 'ssb-typescript';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {Likes} from '../../drivers/ssb';
import React = require('react');

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  col: {
    flexDirection: 'column',
  },

  likeCount: {
    flexDirection: 'row',
    fontWeight: 'bold',
  },

  likes: {
    paddingTop: Dimensions.verticalSpaceSmall,
    paddingBottom: Dimensions.verticalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  likesHidden: {
    paddingTop: Dimensions.verticalSpaceSmall,
    paddingBottom: Dimensions.verticalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.backgroundText,
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
    size: Dimensions.iconSizeSmall,
    color: Palette.textWeak,
    name: 'thumb-up-outline',
  },
  maybeLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.foregroundNeutral,
    name: 'thumb-up',
  },
  yesLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.backgroundBrandWeak,
    name: 'thumb-up',
  },
  reply: {
    size: Dimensions.iconSizeSmall,
    color: Palette.textWeak,
    name: 'comment-outline',
  },
};

export type Props = {
  msg: Msg;
  selfFeedId: FeedId;
  likes: Likes;
  onPressLikeCount?: (ev: {msgKey: MsgId; likes: Likes}) => void;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
};

export type State = {
  ilike: 'no' | 'maybe' | 'yes';
  likeCount: number;
};

export default class MessageFooter extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.stateFromProps(props, {ilike: 'no', likeCount: 0});
    this._likeCountButtonProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: this.onPressLikeCountHandler.bind(this),
      accessible: true,
      accessibilityLabel: 'Like count Button',
    };
    this._likeButtonProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: this.onPressLikeHandler.bind(this),
      accessible: true,
      accessibilityLabel: 'Like Button',
    };
    this._replyButtonProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: this.onPressReplyHandler.bind(this),
      accessible: true,
      accessibilityLabel: 'Reply Button',
    };
  }

  private _likeCountButtonProps: TouchableNativeFeedbackProperties;
  private _likeButtonProps: TouchableNativeFeedbackProperties;
  private _replyButtonProps: TouchableNativeFeedbackProperties;

  public componentWillReceiveProps(nextProps: Props) {
    this.setState((prev: State) => this.stateFromProps(nextProps, prev));
  }

  private stateFromProps(props: Props, prevState: State): State {
    if (props.likes) {
      const ilike = props.likes.some(
        feedId => feedId === this.props.selfFeedId,
      );
      return {
        ilike: ilike ? 'yes' : 'no',
        likeCount: props.likes.length,
      };
    } else {
      return prevState;
    }
  }

  private onPressLikeCountHandler() {
    const msgKey = this.props.msg.key;
    const likes = this.props.likes;
    const onPressLikeCount = this.props.onPressLikeCount;
    if (onPressLikeCount) {
      onPressLikeCount({msgKey, likes});
    }
  }

  private onPressLikeHandler() {
    const ilike = this.state.ilike;
    this.setState((prev: State) => ({
      ilike: 'maybe',
      likeCount: prev.likeCount,
    }));
    const onPressLike = this.props.onPressLike;
    if (ilike !== 'maybe' && onPressLike) {
      setTimeout(() => {
        onPressLike({
          msgKey: this.props.msg.key,
          like: ilike === 'no' ? true : false,
        });
      });
    }
  }

  private onPressReplyHandler() {
    const onPressReply = this.props.onPressReply;
    if (!onPressReply) return;
    const msgKey = this.props.msg.key;
    const rootKey =
      this.props.msg.value &&
      this.props.msg.value.content &&
      (this.props.msg.value.content as PostContent).root;
    onPressReply({msgKey, rootKey: rootKey || msgKey});
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const prevProps = this.props;
    const prevState = this.state;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextState.likeCount !== prevState.likeCount ||
      nextState.ilike !== prevState.ilike
    );
  }

  public render() {
    const {likeCount, ilike} = this.state;

    const likesComponent = [
      h(View, {style: styles.col}, [
        h(
          Text,
          {
            style: likeCount ? styles.likes : styles.likesHidden,
            accessible: true,
            accessibilityLabel: 'Like Count',
          },
          [
            h(Text, {style: styles.likeCount}, String(likeCount)),
            (likeCount === 1 ? ' like' : ' likes') as any,
          ],
        ),
      ]),
    ];

    const counter = likeCount
      ? h(TouchableNativeFeedback, this._likeCountButtonProps, likesComponent)
      : h(React.Fragment, likesComponent);

    const buttons = [
      h(TouchableNativeFeedback, this._likeButtonProps, [
        h(View, {style: styles.likeButton}, [
          h(Icon, iconProps[ilike + 'Liked']),
          h(Text, {style: styles.likeButtonLabel}, 'Like'),
        ]),
      ]),
    ];

    if (this.props.onPressReply) {
      buttons.push(
        h(TouchableNativeFeedback, this._replyButtonProps, [
          h(View, {style: styles.replyButton}, [
            h(Icon, iconProps.reply),
            h(Text, {style: styles.replyButtonLabel}, 'Comment'),
          ]),
        ]),
      );
    }

    return h(View, {style: styles.col}, [
      h(View, {style: styles.row}, [counter]),
      h(View, {style: styles.row}, buttons),
    ]);
  }
}
