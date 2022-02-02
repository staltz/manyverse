// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
        paddingHorizontal: Dimensions.horizontalSpaceBig * 2,
      },
      default: {
        marginHorizontal: Dimensions.horizontalSpaceBig * 2,
      },
    }),
  },

  image: {
    width: 96,
    height: 96,
  },

  title: {
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },

  description: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export interface Props {
  image?: ImageSourcePropType;
  title: string;
  description: string | Array<string | ReactElement<Text>>;
  style?: StyleProp<ViewStyle>;
}

export default class EmptySection extends PureComponent<Props> {
  public render() {
    const {image, title, description, style} = this.props;

    return h(View, {style: [styles.container, style ?? null]}, [
      image ? h(Image, {style: styles.image, source: image}) : null,
      h(Text, {style: styles.title, selectable: true}, title),
      h(
        Text,
        {style: styles.description, selectable: true},
        description as Array<ReactElement<Text>>,
      ),
    ] as Array<ReactElement<any>>);
  }
}
