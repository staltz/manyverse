// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {
  TouchableHighlight,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {withTitle} from './withTitle';

const size = Dimensions.iconSizeLarge;
const space = Dimensions.horizontalSpaceNormal * 0.5;
const defaultIconSize = Dimensions.iconSizeNormal;

export const styles = StyleSheet.create({
  basics: {
    maxWidth: size,
    maxHeight: size,
    borderRadius: size * 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  leftSide: {marginLeft: -space},

  rightSide: {marginRight: -space},
});

const Touchable = Platform.select<any>({
  ios: TouchableOpacity,
  default: TouchableHighlight,
});

export interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  color?: string;
  icon: string;
  iconSize?: number;
  accessibilityLabel: string;
  side?: 'left' | 'right' | 'neutral';
  style?: ViewStyle;
}

export default class HeaderButton extends PureComponent<Props> {
  static readonly size = size;

  public render() {
    const {
      onPress,
      onLongPress,
      color,
      icon,
      iconSize,
      accessibilityLabel,
      side,
      style,
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
      withTitle(Touchable),
      {
        style: [styles.basics, sideStyle, {padding}, style],
        onPress,
        onLongPress,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: Palette.transparencyDarkWeak,
        activeOpacity: 0.4,
        title: accessibilityLabel,
      },
      [
        h(Icon, {
          size: iconSize ?? defaultIconSize,
          color: color ?? Palette.textWeak,
          name: icon,
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel,
        }),
      ],
    );
  }
}
