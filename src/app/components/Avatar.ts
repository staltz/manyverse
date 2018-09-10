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

import {h} from '@cycle/react';
import {View, Image, StyleProp, ViewStyle} from 'react-native';
import {PureComponent} from 'react';
import {Palette} from '../global-styles/palette';

export type Props = {
  size: number;
  url: string | null | undefined;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default class Avatar extends PureComponent<Props> {
  public render() {
    const {style, size, backgroundColor, url} = this.props;
    const borderRadius = size >> 1; // tslint:disable-line:no-bitwise
    const baseStyle = {
      height: size,
      width: size,
      borderRadius,
      backgroundColor: backgroundColor || Palette.indigo1,
    };
    return h(View, {style: [baseStyle, style]}, [
      h(Image, {
        style: {borderRadius, width: size, height: size},
        source: url ? {uri: url} : require('../../../images/empty-avatar.png'),
      }),
    ]);
  }
}
