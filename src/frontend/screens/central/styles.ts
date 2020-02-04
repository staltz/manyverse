/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet, ViewStyle} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {getStatusBarHeight} from 'react-native-status-bar-height';

const page: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: Dimensions.toolbarHeight - getStatusBarHeight(true),
  right: 0,
  backgroundColor: Palette.backgroundVoid,
  justifyContent: 'center',
  alignItems: 'center',
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.backgroundVoid,
  },

  pageHidden: {...page, zIndex: 10},

  pageShown: {...page, zIndex: 20},

  tabBar: {
    zIndex: 30,
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height: Dimensions.toolbarHeight - getStatusBarHeight(true),
    borderTopColor: Palette.textLine,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: Palette.backgroundText,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuBackdrop: {
    backgroundColor: Palette.transparencyDarkStrong,
    opacity: 1,
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
    color: Palette.foregroundNeutral,
  },

  tabSelected: {
    size: Dimensions.iconSizeNormal,
    color: Palette.textBrand,
  },
};
