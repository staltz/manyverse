/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {View, Image, StyleProp, ViewStyle} from 'react-native';
import {PureComponent} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';

export type Props = {
  size: number;
  url: string | null | undefined;
  backgroundColor?: string;
  overlayIcon?: string;
  style?: StyleProp<ViewStyle>;
};

export default class Avatar extends PureComponent<Props> {
  private renderOverlayIcon(
    size: number,
    borderRadius: number,
    overlayIcon: string,
  ) {
    const overlayStyle = {
      height: size,
      width: size,
      borderRadius,
      position: 'absolute' as 'absolute',
      backgroundColor: '#00000033',
    };
    const top = size * 0.5 - Dimensions.iconSizeNormal * 0.5;
    const left = top;
    return h(View, {style: overlayStyle}, [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.colors.white,
        name: overlayIcon,
        style: {top, left},
      }),
    ]);
  }

  public render() {
    const {style, size, backgroundColor, url, overlayIcon} = this.props;
    const borderRadius = size >> 1; // tslint:disable-line:no-bitwise
    const baseStyle = {
      height: size,
      width: size,
      borderRadius,
      backgroundColor: backgroundColor || Palette.colors.indigo1,
    };
    return h(View, {style: [baseStyle, style]}, [
      h(Image, {
        style: {borderRadius, width: size, height: size},
        source: url ? {uri: url} : require('../../../images/empty-avatar.png'),
      }),
      overlayIcon
        ? this.renderOverlayIcon(size, borderRadius, overlayIcon)
        : null as any,
    ]);
  }
}
