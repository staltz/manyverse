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
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: 0,
    flex: 0,
    minHeight: avatarSize,
    height: avatarSize,
  },

  authorAvatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  authorName: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  timestamp: {
    marginTop: 1,
    marginLeft: Dimensions.horizontalSpaceTiny,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    marginTop: 0,
    marginBottom: 0,
    flex: 0,
    minHeight: Dimensions.iconSizeNormal + Dimensions.verticalSpaceSmall * 2,
    height: Dimensions.iconSizeNormal + Dimensions.verticalSpaceSmall * 2,
  },

  footerButtonContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceSmall,
    marginRight: Dimensions.horizontalSpaceNormal,
  },

  contentWarningOff: {
    ...contentWarning,
    color: Palette.textVeryWeak,
  },

  contentWarningOn: {
    ...contentWarning,
    color: Palette.textBrand,
  },

  composeInput: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: Dimensions.verticalSpaceSmall,
    paddingHorizontal: 0,
    marginTop: Dimensions.verticalSpaceBig + Dimensions.verticalSpaceTiny,
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeNormal,
    fontFamily: Platform.select({web: Typography.fontFamilyReadableText}),
    lineHeight: Typography.lineHeightNormal,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.text,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },

  scroll: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  scrollContent: {
    paddingBottom: Dimensions.verticalSpaceBig,
  },

  preview: {
    flex: 1,
    marginTop: Dimensions.verticalSpaceNormal,
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
