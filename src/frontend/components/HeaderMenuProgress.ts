/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {TouchableHighlight, StyleSheet, Animated, Easing} from 'react-native';
import {h} from '@cycle/react';
import * as Progress from 'react-native-progress';
import {t} from '../drivers/localization';
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

export type Props = {
  onPress?: () => void;
  onLongPress?: () => void;
  progress: number;
  color?: string;
  iconSize?: number;
  side?: 'left' | 'right' | 'neutral';
};

export default class HeaderMenuProgress extends PureComponent<Props> {
  private spin = new Animated.Value(0);
  private rotateZ: Animated.AnimatedInterpolation;

  componentDidMount() {
    Animated.loop(
      Animated.timing(this.spin, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    this.rotateZ = this.spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  }

  public render() {
    const {onPress, onLongPress, color, iconSize, progress, side} = this.props;
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
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t('call_to_action.open_menu.accessibility_label'),
      },
      [
        h(
          Animated.View,
          {style: {transform: [{rotateZ: this.rotateZ ?? '0deg'}]}},
          [
            h(Progress.Circle as any, {
              animated: true,
              progress: Math.min(Math.max(0.03, progress), 0.97),
              size: iconSize ?? defaultIconSize,
              color: color ?? Palette.textForBackgroundBrand,
              unfilledColor: Palette.transparencyDark,
              borderWidth: 0,
            }),
          ],
        ),
      ],
    );
  }
}
