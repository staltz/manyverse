/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const avatarSize = Dimensions.avatarSizeBig;
const avatarSizeHalf = avatarSize * 0.5;
export const toolbarAvatarSize = Dimensions.avatarSizeSmall;

export const coverHeight = avatarSizeHalf;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
  },

  cover: {
    backgroundColor: Palette.backgroundBrand,
    height: coverHeight,
    zIndex: 10,
  },

  avatarTouchable: {
    position: 'absolute',
    top: Dimensions.toolbarHeight + coverHeight - avatarSizeHalf,
    left: Dimensions.horizontalSpaceBig,
    width: avatarSize,
    height: avatarSize,
    zIndex: 19,
  },

  avatar: {
    zIndex: 20,
  },

  name: {
    position: 'absolute',
    color: 'white',
    top:
      Dimensions.toolbarHeight + coverHeight - Typography.fontSizeLarge * 1.75,
    left:
      Dimensions.horizontalSpaceBig +
      avatarSize +
      Dimensions.horizontalSpaceBig,
    right: Dimensions.horizontalSpaceBig + Dimensions.iconSizeNormal,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    zIndex: 20,
  },

  header: {
    backgroundColor: Palette.backgroundText,
  },

  sub: {
    marginTop: Dimensions.verticalSpaceSmall,
    marginLeft:
      Dimensions.horizontalSpaceBig + // left margin to the avatar
      avatarSize + // avatar
      Dimensions.horizontalSpaceBig - // right margin to the avatar
      Dimensions.horizontalSpaceSmall, // minus follows-you-text margin
    marginRight: Dimensions.horizontalSpaceBig,
    zIndex: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  followsYou: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.backgroundVoidWeak,
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
    zIndex: 10,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingTop: Dimensions.verticalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundText,
  },

  bioButton: {
    minWidth: avatarSize,
  },

  feed: {
    bottom: 0,
    backgroundColor: Palette.backgroundVoid,
    alignSelf: 'stretch',
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceBig * 2,
  },
});
