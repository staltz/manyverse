/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform, StyleSheet, ViewStyle} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
const {isIPhoneWithMonobrow} = require('react-native-status-bar-height');

const page: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: Platform.select({
    web: 0,
    default: Dimensions.toolbarHeight - getStatusBarHeight(true),
  }),
  right: 0,
  backgroundColor: Palette.voidMain,
  justifyContent: 'center',
  alignItems: 'center',
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.voidMain,
  },

  pageHidden: {...page, zIndex: 10},

  pageShown: {...page, zIndex: 20},

  tabBar: {
    zIndex: 30,
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height:
      Dimensions.toolbarHeight -
      getStatusBarHeight(true) +
      (isIPhoneWithMonobrow() ? 15 : Platform.OS === 'ios' ? 8 : 0),
    borderTopColor: Palette.textLine,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: Palette.backgroundText,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  desktopFabContainer: {
    position: 'absolute',
    bottom: 0,
    right: Dimensions.desktopSideWidth.vw,
  },
});
