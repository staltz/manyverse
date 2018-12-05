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
  statusBarColor: Palette.backgroundBrandStrong,
  navBarBackgroundColor: Palette.backgroundBrand,
  navBarTextColor: Palette.foregroundBrand,
  navBarTextFontSize: Typography.fontSizeLarge,
  navBarTextFontFamily: Typography.fontFamilyReadableText,
  navBarButtonColor: Palette.foregroundBrand,
  topBarElevationShadowEnabled: false,
  navBarTextFontBold: true,
};

export const avatarSize = Dimensions.avatarSizeNormal;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
  },

  bodyContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  avatar: {
    marginTop: Dimensions.verticalSpaceBig,
  },

  composeInput: {
    flex: 1,
    paddingBottom: 0,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: 1,
    marginTop: Dimensions.verticalSpaceBig,
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeBig,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.text,
  },
});
