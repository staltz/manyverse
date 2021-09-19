/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet, TextStyle, Platform} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

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

export const avatarSize = Dimensions.avatarSizeNormal;

const contentWarning: TextStyle = {
  fontSize: Typography.fontSizeBig,
  lineHeight: Typography.lineHeightBig,
  fontFamily: Typography.fontFamilyReadableText,
  fontWeight: 'bold',
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
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
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

  sideButtonContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceNormal,
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
    marginTop: Platform.select({
      ios: Dimensions.verticalSpaceLarge,
      default: Dimensions.verticalSpaceBig,
    }),
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeBig,
    fontFamily: Platform.select({web: Typography.fontFamilyReadableText}),
    lineHeight: Typography.lineHeightBig,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.text,
    ...Platform.select({
      web: {
        paddingTop: Dimensions.verticalSpaceNormal,
        outlineStyle: 'none',
      },
    }),
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

  mentionsOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.backgroundText,
  },

  mentionsInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Palette.backgroundText,
    paddingLeft:
      Dimensions.horizontalSpaceBig +
      (Dimensions.avatarSizeNormal - Dimensions.iconSizeNormal) * 0.5,
    elevation: 3,
    ...Platform.select({
      ios: {
        zIndex: 10,
        paddingBottom: Dimensions.verticalSpaceSmall,
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },

  mentionsInput: {
    flex: 1,
    alignSelf: 'stretch',
    paddingBottom: Dimensions.verticalSpaceSmall,
    paddingLeft: 3,
    marginLeft:
      (Dimensions.avatarSizeNormal - Dimensions.iconSizeNormal) * 0.5 +
      Dimensions.horizontalSpaceTiny,
    marginTop: Platform.select({
      ios: 25.5,
      default: Dimensions.verticalSpaceBig,
    }),
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.text,
  },

  mentionsIcon: {
    marginBottom: Platform.select({
      ios: Dimensions.verticalSpaceTiny,
      default: Dimensions.verticalSpaceSmall,
    }),
  },

  mentionsCancelButton: {
    borderRadius: Dimensions.borderRadiusNormal,
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceTiny,
    marginRight: Dimensions.horizontalSpaceBig,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  mentionsCancelText: {
    color: Palette.textBrand,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
  },

  mentionsList: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
