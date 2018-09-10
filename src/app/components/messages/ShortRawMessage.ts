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
import {h} from '@cycle/react';
import {Text, View, TouchableNativeFeedback, StyleSheet} from 'react-native';
import HumanTime from 'react-human-time';
import {Msg, PostContent} from 'ssb-typescript';
import {authorName} from '../../../ssb/from-ssb';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {isPrivate} from 'ssb-typescript/utils';
import Avatar from '../Avatar';

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: Palette.brand.textBackground,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  authorColumn: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.text,
    minWidth: 120,
  },

  msgType: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyMonospace,
    backgroundColor: Palette.brand.darkVoidBackground,
    color: Palette.brand.darkText,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  msg: Msg;
  name: string | null;
  imageUrl: string | null;
  onPress?: (ev: {msg: Msg}) => void;
};

export default class RawMessage extends Component<Props> {
  private _onPress() {
    const {onPress, msg} = this.props;
    if (onPress) {
      onPress({msg});
    }
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextProps.name !== prevProps.name ||
      nextProps.imageUrl !== prevProps.imageUrl
    );
  }

  public render() {
    const {msg, name, imageUrl} = this.props;
    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: () => this._onPress(),
    };

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      authorName(name, msg),
    );

    const msgTypeText = h(
      Text,
      {style: styles.msgType},
      isPrivate(msg)
        ? 'encrypted'
        : 'type: ' + (msg.value.content as PostContent).type,
    );

    const timestampText = h(Text, {style: styles.timestamp}, [
      h(HumanTime as any, {time: msg.value.timestamp}),
    ]);

    return h(View, [
      h(TouchableNativeFeedback, touchableProps, [
        h(View, {style: styles.row}, [
          h(Avatar, {
            url: imageUrl,
            size: Dimensions.avatarSizeNormal,
            style: styles.avatar,
          }),
          h(View, {style: styles.authorColumn}, [
            authorNameText,
            h(Text, [timestampText, '  ' as any, msgTypeText]),
          ]),
        ]),
      ]),
    ]);
  }
}
