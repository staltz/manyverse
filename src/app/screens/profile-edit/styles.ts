/* Copyright (C) 2018 The Manyverse Authors.
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
    backgroundColor: Palette.brand.textBackground,
  },

  cover: {
    backgroundColor: Palette.brand.background,
    height: avatarSizeHalf,
    zIndex: 10,
  },

  fields: {
    top: -avatarSize,
    marginBottom: -avatarSize,
    zIndex: 10,
    paddingTop: avatarSizeHalf + Dimensions.verticalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.brand.textBackground,
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

  label: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.brand.textWeak,
    marginLeft: 3,
  },

  textInput: {
    fontSize: Typography.fontSizeNormal,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  save: {
    position: 'absolute',
    top:
      Dimensions.toolbarAndroidHeight +
      avatarSizeHalf +
      Dimensions.verticalSpaceSmall,
    right: Dimensions.horizontalSpaceBig,
    zIndex: 30,
  },
});
