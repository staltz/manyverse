/* Copyright (C) 2018-2019 The Manyverse Authors.
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

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
  },

  cover: {
    backgroundColor: Palette.backgroundBrand,
    height: avatarSizeHalf,
    zIndex: 10,
  },

  name: {
    color: 'white',
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    maxWidth: 220,
    top: Dimensions.verticalSpaceSmall,
    left:
      Dimensions.horizontalSpaceBig +
      avatarSize +
      Dimensions.horizontalSpaceBig,
  },

  descriptionArea: {
    top: -avatarSize,
    marginBottom: -avatarSize,
    zIndex: 10,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingTop: avatarSizeHalf + Dimensions.verticalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundText,
  },

  bioButton: {
    minWidth: avatarSize,
  },

  description: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
  },

  feed: {
    top: Dimensions.verticalSpaceNormal * 0.5,
    bottom: 0,
    backgroundColor: Palette.backgroundVoid,
    alignSelf: 'stretch',
  },

  feedWithHeader: {
    top: Dimensions.verticalSpaceNormal,
    bottom: 0,
    backgroundColor: Palette.backgroundVoid,
    alignSelf: 'stretch',
  },

  sub: {
    position: 'absolute',
    top:
      Dimensions.toolbarHeight + avatarSizeHalf + Dimensions.verticalSpaceSmall,
    left:
      Dimensions.horizontalSpaceBig + // left margin to the avatar
      avatarSize + // avatar
      Dimensions.horizontalSpaceBig - // right margin to the avatar
      Dimensions.horizontalSpaceSmall, // minus follows-you-text margin
    right: Dimensions.horizontalSpaceBig,
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

  avatarTouchable: {
    top: -avatarSizeHalf,
    left: Dimensions.horizontalSpaceBig,
    width: avatarSize,
    height: avatarSize,
    zIndex: 19,
  },

  avatar: {
    zIndex: 20,
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceBig * 2,
  },
});
