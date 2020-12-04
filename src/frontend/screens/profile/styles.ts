/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const AVATAR_SIZE = Dimensions.avatarSizeBig;
const AVATAR_SIZE_HALF = AVATAR_SIZE * 0.5;

export const AVATAR_SIZE_TOOLBAR = Dimensions.avatarSizeSmall;

export const COVER_HEIGHT = AVATAR_SIZE_HALF;

export const BIO_MARKDOWN_MAX_HEIGHT = 54;

const SCROLL_BOUNCE_REGION = 250;

export const NAME_MARGIN_TOOLBAR = Typography.fontSizeLarge * 0.5 - 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
  },

  cover: {
    position: 'absolute',
    top: -SCROLL_BOUNCE_REGION,
    left: 0,
    right: 0,
    backgroundColor: Palette.brandMain,
    height: SCROLL_BOUNCE_REGION + COVER_HEIGHT,
    zIndex: 10,
  },

  avatarTouchable: {
    position: 'absolute',
    top: Dimensions.toolbarHeight + COVER_HEIGHT - AVATAR_SIZE_HALF,
    left: Dimensions.horizontalSpaceBig,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    zIndex: 19,
  },

  avatar: {
    zIndex: 20,
  },

  name: {
    position: 'absolute',
    color: Palette.textForBackgroundBrand,
    top:
      Dimensions.toolbarHeight + COVER_HEIGHT - Typography.fontSizeLarge * 1.75,
    left:
      Dimensions.horizontalSpaceBig +
      AVATAR_SIZE +
      Dimensions.horizontalSpaceBig,
    right: Dimensions.horizontalSpaceBig + Dimensions.iconSizeNormal,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    zIndex: 20,
  },

  header: {
    marginTop: Dimensions.toolbarHeight + getStatusBarHeight(true),
    backgroundColor: Palette.backgroundText,
  },

  sub: {
    marginTop: COVER_HEIGHT + Dimensions.verticalSpaceSmall,
    marginLeft:
      Dimensions.horizontalSpaceBig + // left margin to the avatar
      AVATAR_SIZE + // avatar
      Dimensions.horizontalSpaceBig - // right margin to the avatar
      Dimensions.horizontalSpaceSmall, // minus follows-you-text margin
    minHeight: AVATAR_SIZE_HALF,
    marginRight: Dimensions.horizontalSpaceBig,
    zIndex: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  followsYou: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.voidWeak,
    borderRadius: 3,
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceTiny,
  },

  followsYouText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  cta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  follow: {
    marginLeft: Dimensions.horizontalSpaceNormal,
  },

  descriptionArea: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundText,
    maxHeight: BIO_MARKDOWN_MAX_HEIGHT + 1,
  },

  readBio: {
    backgroundColor: Palette.backgroundText,
    minWidth: 50,
    position: 'absolute',
    bottom: 0,
    right: Dimensions.horizontalSpaceBig,
    zIndex: 20,
  },

  headerMarginBottom: {
    backgroundColor: Palette.backgroundText,
    paddingBottom: Dimensions.verticalSpaceNormal,
  },

  feed: {
    bottom: 0,
    backgroundColor: Palette.voidMain,
    alignSelf: 'stretch',
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceBig * 2,
  },
});
