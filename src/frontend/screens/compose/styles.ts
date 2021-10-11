// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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

  menuBackdrop: {
    display: 'none',
  },

  menuOptions: {
    ...Platform.select({
      web: {
        boxShadow: `0 0 5px 0 ${Palette.transparencyDarkStrong}`,
      },
      android: {
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },

  menuOptionWrapper: {
    padding: 0,
  },

  menuOptionTouchable: {
    margin: 0,
  },
});
