// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, TextStyle, Platform} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';

export const avatarSize = Dimensions.avatarSizeNormal;

const contentWarning: TextStyle = {
  fontSize: Typography.fontSizeBig,
  lineHeight: Typography.lineHeightBig,
  fontFamily: Typography.fontFamilyReadableText,
  fontWeight: 'bold',
  paddingHorizontal: Dimensions.horizontalSpaceSmall,
};

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: {
    ...globalStyles.container,
    backgroundColor: Palette.backgroundText,
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

  authorNameSection: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
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
        backgroundColor: Palette.textLine,
      },
      android: {
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        backgroundColor: Palette.textLine,
      },
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        backgroundColor: Palette.textLine,
      },
    }),
  },

  menuOptionWrapper: {
    padding: 0,
  },

  menuOptionTouchable: {
    margin: 0,
  },

  boldText: {
    maxWidth: 100,
    color: Palette.text,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
  },
});
