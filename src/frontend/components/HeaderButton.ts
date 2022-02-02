// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {TouchableHighlight, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';

const size = 36;
const space = Dimensions.horizontalSpaceNormal * 0.5;
const defaultIconSize = Dimensions.iconSizeNormal;

export const styles = StyleSheet.create({
  basics: {
    maxWidth: size,
    maxHeight: size,
    borderRadius: size * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  leftSide: {marginLeft: -space},

  rightSide: {marginRight: -space},
});

export interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  color?: string;
  icon: string;
  iconSize?: number;
  accessibilityLabel: string;
  side?: 'left' | 'right' | 'neutral';
}

export default class HeaderButton extends PureComponent<Props> {
  public render() {
    const {
      onPress,
      onLongPress,
      color,
      icon,
      iconSize,
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
    const padding = (size - (iconSize ?? defaultIconSize)) * 0.5;

    return h(
      TouchableHighlight,
      {
        style: [styles.basics, sideStyle, {padding}],
        onPress,
        onLongPress,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: Palette.transparencyDarkWeak,
      },
      [
        h(Icon, {
          size: iconSize ?? defaultIconSize,
          color: color ?? 'white',
          name: icon,
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel,
        }),
      ],
    );
  }
}
