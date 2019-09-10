/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet, TextStyle} from 'react-native';
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

const contentWarning: TextStyle = {
  fontSize: Typography.fontSizeBig,
  fontWeight: 'bold',
  fontFamily: Typography.fontFamilyReadableText,
  paddingHorizontal: Dimensions.horizontalSpaceSmall,
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
    flexDirection: 'row',
    backgroundColor: Palette.backgroundText,
    paddingLeft: Dimensions.horizontalSpaceBig,
  },

  leftSide: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  contentWarningOff: {
    ...contentWarning,
    color: Palette.textVeryWeak,
  },

  contentWarningOn: {
    ...contentWarning,
    color: Palette.textBrand,
  },

  addPictureContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  leftSpacer: {
    flex: 1,
  },

  composeInput: {
    flex: 1,
    paddingBottom: Dimensions.verticalSpaceSmall,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: 1,
    marginRight: Dimensions.horizontalSpaceBig,
    marginTop: Dimensions.verticalSpaceBig,
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeBig,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.text,
  },

  composePreview: {
    flex: 1,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceBig,
    alignSelf: 'stretch',
  },

  previewContentContainer: {
    paddingTop: Dimensions.verticalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceBig,
  },
});
