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

import {PureComponent, createElement} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import Markdown from 'react-native-simple-markdown';
import {rules, styles as mdstyles} from '../../global-styles/markdown';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import MessageContainer from './MessageContainer';
import {Msg, AboutContent as About} from '../../ssb/types';
import {authorName, humanTime} from '../../ssb/utils';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    maxWidth: 120,
    color: Palette.brand.textWeak
  },

  followed: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  }
});

export default class AboutMessage extends PureComponent<{msg: Msg<About>}> {
  private interval: any;

  public componentDidMount() {
    this.interval = setInterval(() => this.forceUpdate(), 30e3);
  }

  public componentWillUnmount() {
    clearInterval(this.interval);
  }

  public render() {
    const {msg} = this.props;
    const accountTextProps = {
      numberOfLines: 1,
      ellipsizeMode: 'middle' as 'middle',
      style: styles.account
    };

    const hasName = !!msg.value.content.name;
    const hasDescription = !!msg.value.content.description;

    if (hasName && hasDescription) {
      return h(MessageContainer, [
        h(View, {style: styles.row}, [
          h(Text, accountTextProps, authorName(msg)),
          h(Text, {style: styles.followed}, ' is using the name '),
          h(Text, accountTextProps, msg.value.content.name),
          h(Text, {style: styles.followed}, ' and the description: ')
        ]),
        h(Markdown, {styles: mdstyles, rules}, msg.value.content.description),
        h(View, {style: styles.row}, [
          h(Text, {style: styles.timestamp}, humanTime(msg.value.timestamp))
        ])
      ]);
    } else if (hasDescription) {
      return h(MessageContainer, [
        h(View, {style: styles.row}, [
          h(Text, accountTextProps, authorName(msg)),
          h(Text, {style: styles.followed}, ' has a new description: ')
        ]),
        h(Markdown, {styles: mdstyles, rules}, msg.value.content.description),
        h(View, {style: styles.row}, [
          h(Text, {style: styles.timestamp}, humanTime(msg.value.timestamp))
        ])
      ]);
    } else {
      return h(MessageContainer, [
        h(View, {style: styles.row}, [
          h(Text, accountTextProps, authorName(msg)),
          h(Text, {style: styles.followed}, ' is using the name '),
          h(Text, accountTextProps, msg.value.content.name)
        ]),
        h(View, {style: styles.row}, [
          h(Text, {style: styles.timestamp}, humanTime(msg.value.timestamp))
        ])
      ]);
    }
  }
}
