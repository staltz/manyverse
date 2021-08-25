/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform, StyleSheet} from 'react-native';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  header: {
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.textWeak,
  },

  queryInput: {
    flex: 1,
    alignSelf: 'stretch',
    marginLeft: Dimensions.horizontalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceSmall,
    fontSize: Typography.fontSizeBig,
    textAlign: 'left',
    textAlignVertical: 'center',
    color: Palette.textForBackgroundBrand,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  bodySection: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  feed: {
    bottom: 0,
    backgroundColor: Palette.voidMain,
    alignSelf: 'stretch',
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceLarger,
  },

  result: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  resultBody: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  resultHeader: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultAuthor: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  resultTimestamp: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    marginLeft: Dimensions.horizontalSpaceSmall,
    color: Palette.textWeak,
  },

  resultContent: {
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Platform.select({web: Typography.fontFamilyReadableText}),
    lineHeight: Typography.lineHeightNormal,
    marginTop: Dimensions.verticalSpaceSmall,
  },

  bold: {
    fontWeight: 'bold',
  },

  placeholderContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    backgroundColor: Palette.backgroundText,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: 120,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  placeholderAvatar: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Math.ceil(Dimensions.avatarSizeNormal * 0.5),
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
    marginRight: Dimensions.horizontalSpaceSmall + 2,
  },

  placeholderAuthor: {
    flex: 1,
  },

  placeholderAuthorInner: {
    width: 110,
    height: 16,
    marginTop: 6,
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
  },

  placeHolderTimestamp: {
    width: 100,
    height: 16,
    marginTop: 6,
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
  },
});
