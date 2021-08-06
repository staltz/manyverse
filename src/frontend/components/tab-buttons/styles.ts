/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform, StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
const {isIPhoneWithMonobrow} = require('react-native-status-bar-height');

export const styles = StyleSheet.create({
  tabButton: {
    flex: Platform.select({default: 1, web: undefined}),
    flexDirection: Platform.select({default: 'column', web: 'row'}),
    justifyContent: Platform.select({default: 'center', web: 'flex-start'}),
    alignItems: 'center',
    marginTop: Platform.select({ios: isIPhoneWithMonobrow() ? -5 : 0}),
  },

  tabButtonText: {
    marginLeft: Platform.select({web: Dimensions.horizontalSpaceSmall}),
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    fontWeight: Platform.select({web: 'bold'}),
  },

  tabButtonTextSelected: {
    marginLeft: Platform.select({web: Dimensions.horizontalSpaceSmall}),
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textBrand,
    fontWeight: 'bold',
  },

  updatesCoverAll: {
    height: 11,
    position: 'absolute',
    top: 8.5,
    left: 5,
    right: 5,
    backgroundColor: Platform.select({
      default: Palette.backgroundText,
      web: Palette.voidMain,
    }),
  },

  updatesCoverSome: {
    height: 11,
    position: 'absolute',
    top: 8.5,
    left: 5,
    right: 11,
    backgroundColor: Platform.select({
      default: Palette.backgroundText,
      web: Palette.voidMain,
    }),
  },

  updatesCoverNone: {
    display: 'none',
  },
});

export const iconProps = {
  tab: {
    size: Dimensions.iconSizeNormal,
    color: Platform.select({
      default: Palette.textVeryWeak,
      web: Palette.textWeak,
    }),
  },

  tabSelected: {
    size: Dimensions.iconSizeNormal,
    color: Palette.textBrand,
  },
};
