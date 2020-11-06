/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

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
    backgroundColor: Palette.brandMain,
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
  },

  authorImage: {
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  noAuthorName: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
  },

  authorId: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brandWeakest,
    fontWeight: 'normal',
  },

  menuItemContainer: {
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuItemText: {
    marginLeft: Dimensions.horizontalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },
});
