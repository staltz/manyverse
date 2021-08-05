/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
const {isIPhoneWithMonobrow} = require('react-native-status-bar-height');

export const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isIPhoneWithMonobrow() ? -5 : 0,
  },

  tabButtonText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  tabButtonTextSelected: {
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
    backgroundColor: Palette.backgroundText,
  },

  updatesCoverSome: {
    height: 11,
    position: 'absolute',
    top: 8.5,
    left: 5,
    right: 11,
    backgroundColor: Palette.backgroundText,
  },

  updatesCoverNone: {
    display: 'none',
  },
});

export const iconProps = {
  headerIcon: {
    size: Dimensions.iconSizeNormal,
    color: Palette.textForBackgroundBrand,
  },

  tab: {
    size: Dimensions.iconSizeNormal,
    color: Palette.textVeryWeak,
  },

  tabSelected: {
    size: Dimensions.iconSizeNormal,
    color: Palette.textBrand,
  },
};
