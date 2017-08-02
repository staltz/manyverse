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
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {Msg} from '../../types';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1
  },

  likeCount: {
    fontWeight: 'bold'
  },

  likes: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  }
});

export default class MessageFooter extends Component<{msg: Msg}> {
  render() {
    const {msg} = this.props;
    const likeCount =
      (msg.value._derived &&
        msg.value._derived &&
        msg.value._derived.likes &&
        msg.value._derived.likes.length) ||
      0;

    const body = h(Text, {style: styles.likes}, [
      h(Text, {style: styles.likeCount}, String(likeCount)),
      (likeCount === 1 ? ' like' : ' likes') as any
    ]);

    return h(View, {style: styles.row}, likeCount ? [body] : []);
  }
}
