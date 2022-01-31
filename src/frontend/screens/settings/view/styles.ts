// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {globalStyles} from '../../../global-styles/styles';
import {Typography} from '../../../global-styles/typography';

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: globalStyles.containerWithDesktopSideBar,

  section: {
    backgroundColor: Palette.backgroundText,
    paddingTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceBig,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  sectionTitle: {
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.textBrand,
  },

  spacer: {
    height: 1,
    backgroundColor: Palette.voidMain,
  },

  content: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.text,
  },
});
