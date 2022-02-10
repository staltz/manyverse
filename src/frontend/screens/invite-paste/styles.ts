// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';

export const navigatorStyle = {
  statusBarColor: Palette.brandStrong,
  navBarBackgroundColor: Palette.brandMain,
  navBarTextColor: Palette.textForBackgroundBrand,
  navBarTextFontSize: Typography.fontSizeLarge,
  navBarTextFontFamily: Typography.fontFamilyReadableText,
  navBarButtonColor: Palette.textForBackgroundBrand,
  topBarElevationShadowEnabled: false,
  navBarTextFontBold: true,
};

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  bodyContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  contentInput: {
    flex: 1,
    alignSelf: 'stretch',
    marginVertical: Dimensions.verticalSpaceBig,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyMonospace,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.textWeak,
    backgroundColor: Palette.backgroundTextWeak,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: Dimensions.borderRadiusSmall,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        maxHeight: '12em',
      },
    }),
  },

  acceptButtonEnabled: {
    backgroundColor: Palette.backgroundCTA,
    width: 80,
  },

  acceptButtonDisabled: {
    backgroundColor: Palette.brandWeak,
    width: 80,
  },
});
