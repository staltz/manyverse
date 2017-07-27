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

import {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {Msg} from '../../types';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  messageHeaderRow: {
    flexDirection: 'row',
    flex: 1
  },

  messageAuthorImage: {
    height: 50,
    width: 50,
    borderRadius: 3,
    backgroundColor: Palette.blue3,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall
  },

  messageHeaderAuthorColumn: {
    flexDirection: 'column',
    flex: 1
  },

  flexRow: {
    flexDirection: 'row',
    flex: 1
  },

  messageHeaderAuthorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.text
  },

  messageHeaderTimestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  }
});

export default class MessageHeader extends PureComponent<{msg: Msg}> {
  render() {
    const {msg} = this.props;

    const messageHeaderAuthorName = h(View, {style: styles.flexRow}, [
      h(
        Text,
        {
          numberOfLines: 1,
          ellipsizeMode: 'middle',
          style: styles.messageHeaderAuthorName
        },
        msg.value.author
      )
    ]);

    const messageHeaderTimestamp = h(View, {style: styles.flexRow}, [
      h(
        Text,
        {style: styles.messageHeaderTimestamp},
        String(msg.value.timestamp)
      )
    ]);

    return h(View, {style: styles.messageHeaderRow}, [
      h(View, {style: styles.messageAuthorImage}),
      h(View, {style: styles.messageHeaderAuthorColumn}, [
        messageHeaderAuthorName,
        messageHeaderTimestamp
      ])
    ]);
  }
}
