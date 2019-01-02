/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    color: Palette.textWeak,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
  },

  description: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export type Props = {
  image?: ImageSourcePropType;
  title: string;
  description: string | Array<string | ReactElement<Text>>;
  style?: StyleProp<ViewStyle>;
};

export default class EmptySection extends PureComponent<Props> {
  public render() {
    const {image, title, description, style} = this.props;

    return h(
      View,
      {style: [styles.container, style || null]},
      [
        image ? h(Image, {style: styles.image as any, source: image}) : null,
        h(Text, {style: styles.title, selectable: true}, title),
        h(
          Text,
          {style: styles.description, selectable: true},
          description as Array<ReactElement<Text>>,
        ),
      ] as Array<ReactElement<any>>,
    );
  }
}
