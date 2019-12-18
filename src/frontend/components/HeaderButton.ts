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
import {Dimensions} from '../global-styles/dimens';

const size = 36;
const space = Dimensions.horizontalSpaceNormal * 0.5;
const iconSize = size - space - space;

export const styles = StyleSheet.create({
  basics: {
    maxWidth: size,
    maxHeight: size,
    borderRadius: size * 0.5,
    padding: space,
  },

  leftSide: {marginLeft: -space},

  rightSide: {marginRight: -space},
});

export type Props = {
  onPress?: () => void;
  onLongPress?: () => void;
  color?: string;
  icon: string;
  accessibilityLabel: string;
  side?: 'left' | 'right' | 'neutral';
};

export default class HeaderButton extends PureComponent<Props> {
  public render() {
    const {
      onPress,
      onLongPress,
      color,
      icon,
      accessibilityLabel,
      side,
    } = this.props;
    const sideStyle =
      side === 'left'
        ? styles.leftSide
        : side === 'right'
        ? styles.rightSide
        : side === 'neutral'
        ? null
        : styles.leftSide;

    return h(
      TouchableHighlight,
      {
        style: [styles.basics, sideStyle],
        onPress,
        onLongPress,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: Palette.transparencyDarkWeak,
      },
      [
        h(Icon, {
          size: iconSize,
          color: color ?? 'white',
          name: icon,
          accessible: true,
          accessibilityLabel,
        }),
      ],
    );
  }
}
