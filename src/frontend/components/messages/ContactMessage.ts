/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    color: Palette.textWeak,
  },

  followed: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
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
