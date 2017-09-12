/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
import {View, Text, TouchableNativeFeedback, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Msg} from '../../ssb/types';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1
  },

  col: {
    flexDirection: 'column'
  },

  hr: {
    backgroundColor: Palette.gray4,
    height: 1,
    marginTop: Dimensions.verticalSpaceSmall,
    marginBottom: 0
  },

  likeCount: {
    fontWeight: 'bold'
  },

  likes: {
    marginTop: Dimensions.verticalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  },

  likeButton: {
    flexDirection: 'row',
    paddingTop: Dimensions.verticalSpaceSmall + 6,
    paddingBottom: Dimensions.verticalSpaceBig,
    paddingLeft: 1,
    paddingRight: Dimensions.horizontalSpaceBig,
    marginBottom: -Dimensions.verticalSpaceBig
  },

  likeButtonLabel: {
    fontSize: Typography.fontSizeSmall,
    fontWeight: 'bold',
    marginLeft: Dimensions.horizontalSpaceSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  }
});

const iconProps = {
  noLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.brand.textWeak,
    name: 'thumb-up-outline'
  },
  maybeLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.gray6,
    name: 'thumb-up'
  },
  yesLiked: {
    size: Dimensions.iconSizeSmall,
    color: Palette.indigo6,
    name: 'thumb-up'
  }
};

export type Props = {
  msg: Msg;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
};

export type State = {
  ilike: 'no' | 'maybe' | 'yes';
};

export default class MessageFooter extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    if (props.msg.value._derived && props.msg.value._derived.ilike === true) {
      this.state = {ilike: 'yes'};
    } else {
      this.state = {ilike: 'no'};
    }
  }

  componentWillReceiveProps(props: Props) {
    if (props.msg.value._derived && props.msg.value._derived.ilike === true) {
      this.setState(() => ({ilike: 'yes'}));
    } else {
      this.setState(() => ({ilike: 'no'}));
    }
  }

  private _onPressLike() {
    const ilike = this.state.ilike;
    this.setState(() => ({ilike: 'maybe'}));
    const onPressLike = this.props.onPressLike;
    if (ilike !== 'maybe' && onPressLike) {
      setTimeout(() => {
        onPressLike({
          msgKey: this.props.msg.key,
          like: ilike === 'no' ? true : false
        });
      });
    }
  }

  render() {
    const {msg} = this.props;
    const likeCount =
      (msg.value._derived &&
        msg.value._derived &&
        msg.value._derived.likes &&
        msg.value._derived.likes.length) ||
      0;

    const counters = likeCount
      ? [
          h(View, {style: styles.row}, [
            h(Text, {style: styles.likes}, [
              h(Text, {style: styles.likeCount}, String(likeCount)),
              (likeCount === 1 ? ' like' : ' likes') as any
            ])
          ])
        ]
      : [];

    const likeButtonProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: () => this._onPressLike()
    };
    const likeButton = h(TouchableNativeFeedback, likeButtonProps, [
      h(View, {style: styles.likeButton}, [
        h(Icon, iconProps[this.state.ilike + 'Liked']),
        h(Text, {style: styles.likeButtonLabel}, 'Like')
      ])
    ]);

    return h(View, {style: styles.col}, [
      ...counters,
      h(View, {style: styles.hr}),
      h(View, {style: styles.row}, [likeButton])
    ]);
  }
}
