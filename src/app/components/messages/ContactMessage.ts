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
import {View, Text, StyleSheet} from 'react-native';
import HumanTime from 'react-human-time';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import MessageContainer from './MessageContainer';
import {ContactContent as Contact, Msg} from 'ssb-typescript';
import {authorName, shortFeedId} from '../../../ssb/from-ssb';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    maxWidth: 120,
    color: Palette.brand.textWeak,
  },

  followed: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  msg: Msg<Contact>;
  name: string | null;
};

export default class ContactMessage extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextProps.name !== prevProps.name
    );
  }

  public render() {
    const {msg, name} = this.props;
    const accountTextProps = {
      numberOfLines: 1,
      ellipsizeMode: 'middle' as 'middle',
      style: styles.account,
    };

    return h(MessageContainer, [
      h(View, {style: styles.row}, [
        h(Text, accountTextProps, authorName(name, msg)),
        h(
          Text,
          {style: styles.followed},
          msg.value.content.following
            ? ' started following '
            : ' stopped following ',
        ),
        h(
          Text,
          accountTextProps,
          shortFeedId(msg.value.content.contact || '?'),
        ),
      ]),
      h(View, {style: styles.row}, [
        h(Text, {style: styles.timestamp}, [
          h(HumanTime as any, {time: msg.value.timestamp}),
        ]),
      ]),
    ]);
  }
}
