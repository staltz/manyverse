/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.colors.white,
  },

  header: {
    backgroundColor: Palette.brand.background,
    minHeight: 109,
    paddingTop: Dimensions.verticalSpaceBig,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingRight: Dimensions.horizontalSpaceNormal,
  },

  authorImage: {
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  noAuthorName: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.colors.white,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  authorName: {
    fontFamily: Typography.fontFamilyReadableText,
    fontSize: Typography.fontSizeNormal,
    color: Palette.colors.white,
    fontWeight: 'bold',
  },

  authorId: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.colors.indigo2,
    fontWeight: 'normal',
  },

  menuItemContainer: {
    backgroundColor: Palette.colors.white,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuItemText: {
    fontFamily: Typography.fontFamilyReadableText,
    marginLeft: Dimensions.horizontalSpaceBig,
    color: Palette.brand.textWeak,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
  },
});
