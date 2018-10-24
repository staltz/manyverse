/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const navigatorStyle = {
  statusBarColor: Palette.brand.backgroundDarker,
  navBarBackgroundColor: Palette.brand.background,
  navBarTextColor: Palette.colors.white,
  navBarTextFontSize: Typography.fontSizeLarge,
  navBarTextFontFamily: Typography.fontFamilyReadableText,
  navBarButtonColor: Palette.colors.white,
  topBarElevationShadowEnabled: false,
  navBarTextFontBold: true,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
  },

  bodyContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.brand.textBackground,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  about: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
    textAlign: 'center',
  },

  bold: {
    fontWeight: 'bold',
  },

  inviteCode: {
    marginTop: Dimensions.verticalSpaceBig,
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyMonospace,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.brand.textWeak,
    backgroundColor: Palette.brand.textWeakBackground,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 2,
  },
});
