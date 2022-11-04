// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    maxWidth: Platform.select({
      ios: 290,
      default: 1024,
    }),
  },

  header: {
    backgroundColor: Palette.backgroundText,
    minHeight: Platform.select({
      android: 109,
      default: 100,
    }),
    paddingTop: Platform.select({
      ios: Dimensions.verticalSpaceBig + getStatusBarHeight(true) - 7,
      default: Dimensions.verticalSpaceBig,
    }),
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingRight: Dimensions.horizontalSpaceNormal,
    borderBottomWidth: 1,
    borderBottomColor: Palette.textLine,
  },

  authorImage: {
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    fontWeight: 'bold',
  },

  authorId: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeTiny,
    lineHeight: Typography.lineHeightTiny,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },

  menuItemContainer: {
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuItemContainerCTA: {
    backgroundColor: Palette.backgroundCTA,
  },

  menuItemText: {
    marginLeft: Dimensions.horizontalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },

  menuItemTextCTA: {
    color: Palette.textForBackgroundBrand,
  },

  syncingContainer: {
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'column',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  syncingText: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  syncingEstimateText: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    marginTop: Dimensions.verticalSpaceSmall,
  },
});
