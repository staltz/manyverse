/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  col: {
    flexDirection: 'column',
  },

  likeCount: {
    fontWeight: 'bold',
  },

  likes: {
    marginTop: Dimensions.verticalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },

  likesHidden: {
    marginTop: Dimensions.verticalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textBackground,
  },

  likeButton: {
    flexDirection: 'row',
    paddingTop: Dimensions.verticalSpaceSmall + 6,
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
    color: Palette.brand.textWeak,
  },

  replyButton: {
    flexDirection: 'row',
    paddingTop: Dimensions.verticalSpaceSmall + 6,
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
    color: Palette.brand.textWeak,
  },
});

const iconProps = {
  noLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.brand.textWeak,
    name: 'thumb-up-outline',
  },
  maybeLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.gray6,
    name: 'thumb-up',
  },
  yesLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.indigo6,
    name: 'thumb-up',
  },
  reply: {
    size: Dimensions.iconSizeSmall,
    color: Palette.brand.textWeak,
    name: 'comment-outline',
  },
};

export type Props = {
  msg: Msg;
  selfFeedId: FeedId;
  likes: Array<FeedId> | null;
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
    this.state = this.stateFromProps(props, {ilike: 'maybe', likeCount: 0});
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
      nextState.ilike !== prevState.ilike
    );
  }

  public render() {
    const {likeCount, ilike} = this.state;

    const counter = h(View, {style: styles.row}, [
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
    ]);

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
      counter,
      h(View, {style: styles.row}, buttons),
    ]);
  }
}
