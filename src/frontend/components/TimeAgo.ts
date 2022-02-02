// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {Text, StyleSheet} from 'react-native';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import LocalizedHumanTime from './LocalizedHumanTime';

export const styles = StyleSheet.create({
  normal: {
    marginTop: 1,
    marginLeft: Dimensions.horizontalSpaceTiny,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  unread: {
    marginTop: 1,
    marginLeft: Dimensions.horizontalSpaceTiny,
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
