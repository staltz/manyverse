// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet, ViewStyle} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {globalStyles} from '../../global-styles/styles';
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

const FLARE_WIDTH = 6;
const PROGRESS_BAR_HEIGHT = 2;

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

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

  topBarStub: {
    height: Dimensions.toolbarHeight,
    minHeight: Dimensions.toolbarHeight,
    backgroundColor: Palette.brandMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  progressBar: {
    position: 'absolute',
    zIndex: 1000,
    left: 0,
    right: 0,
    top: -PROGRESS_BAR_HEIGHT,
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: Palette.brandMain,
  },

  progressFlare: {
    position: 'absolute',
    zIndex: 1001,
    left: -FLARE_WIDTH - 1,
    top: -PROGRESS_BAR_HEIGHT,
    height: PROGRESS_BAR_HEIGHT,
    width: FLARE_WIDTH,
    backgroundColor: Palette.brandWeaker,
  },

  desktopFabContainer: {
    position: 'absolute',
    bottom: 0,
    right: `calc(50vw - ${Dimensions.desktopMiddleWidth.px} * 0.5)`,
  },
});
