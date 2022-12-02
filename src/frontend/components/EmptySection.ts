// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, ReactElement, createElement as $} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  Platform,
  Linking,
} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';

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

  link: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    textDecorationLine: 'underline',
    color: Palette.textBrand,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export interface Props {
  image?: ImageSourcePropType;
  title: string;
  description: string | Array<string | ReactElement<Text>>;
  style?: StyleProp<ViewStyle>;
  linkLabel?: string;
  link?: string;
}

export default class EmptySection extends PureComponent<Props> {
  private renderLink() {
    const {link, linkLabel} = this.props;
    if (!link) return null;

    if (Platform.OS === 'web') {
      return $(
        Text,
        {style: styles.link, ['href' as any]: link},
        linkLabel ?? link,
      );
    } else {
      return $(
        Text,
        {
          style: styles.link,
          onPress() {
            Linking.openURL(link);
          },
        },
        linkLabel ?? link,
      );
    }
  }

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
      this.renderLink(),
    ] as Array<ReactElement<any>>);
  }
}
