/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {TouchableHighlight, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';

export const styles = StyleSheet.create({
  leftSide: {
    borderRadius: 18,
    padding: 6,
    marginLeft: -6,
  },

  rightSide: {
    borderRadius: 18,
    padding: 6,
    marginRight: -6,
  },
});

export type Props = {
  onPress?: () => void;
  onLongPress?: () => void;
  color?: string;
  icon: string;
  accessibilityLabel: string;
  rightSide?: boolean;
};

export default class HeaderButton extends PureComponent<Props> {
  public render() {
    const {
      onPress,
      onLongPress,
      color,
      icon,
      accessibilityLabel,
      rightSide,
    } = this.props;
    return h(
      TouchableHighlight,
      {
        style: rightSide ? styles.leftSide : styles.rightSide,
        onPress,
        onLongPress,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: Palette.transparencyDarkWeak,
      },
      [
        h(Icon, {
          size: 24,
          color: color || 'white',
          name: icon,
          accessible: true,
          accessibilityLabel,
        }),
      ],
    );
  }
}
