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

import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: Dimensions.horizontalSpaceBig * 2,
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
  },

  image: {
    width: 96,
    height: 96,
  },

  title: {
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceBig,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
  },

  description: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export type Props = {
  image?: ImageSourcePropType;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

export default class EmptySection extends PureComponent<Props> {
  public render() {
    const {image, title, description, style} = this.props;

    return h(
      View,
      {style: [styles.container, style || null]},
      [
        image ? h(Image, {style: styles.image, source: image}) : null,
        h(Text, {style: styles.title}, title),
        h(Text, {style: styles.description}, description),
      ] as Array<ReactElement<any>>,
    );
  }
}
