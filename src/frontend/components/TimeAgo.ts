// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {Text, StyleSheet} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import LocalizedHumanTime from './LocalizedHumanTime';

export const styles = StyleSheet.create({
  normal: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  unread: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textPositive,
    fontWeight: 'bold',
  },
});

export interface Props {
  unread: boolean;
  timestamp: number;
}

export default class TimeAgo extends PureComponent<Props> {
  public render() {
    const {unread, timestamp} = this.props;

    return $(
      Text,
      {
        key: 't',
        numberOfLines: 1,
        style: unread ? styles.unread : styles.normal,
      },
      $(LocalizedHumanTime, {time: timestamp}),
    );
  }
}
