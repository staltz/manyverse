// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet, ViewStyle} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {globalStyles} from '~frontend/global-styles/styles';

const page: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: Platform.select({
    web: 0,
    default: Dimensions.tabBarHeight,
  }),
  right: 0,
  backgroundColor: Palette.voidMain,
  justifyContent: 'center',
  alignItems: 'center',
};

export const PROGRESS_BAR_HEIGHT = 2;
const PILL_HEIGHT = 24;
export const PILL_WIDTH_SMALL = 46;
export const PILL_WIDTH_LARGE = 56;
export const PILL_MARGIN = Dimensions.horizontalSpaceTiny;
export const FAB_VERTICAL_DISTANCE_TO_EDGE =
  Dimensions.verticalSpaceTiny + PILL_HEIGHT + Dimensions.verticalSpaceNormal;

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
    height: Dimensions.tabBarHeight,
    borderTopColor: Palette.textLine,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: Palette.backgroundText,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  },

  progressPillContainer: {
    position: 'absolute',
    zIndex: 1000,
    left: 0,
    top: -Dimensions.verticalSpaceTiny - PROGRESS_BAR_HEIGHT - PILL_HEIGHT,
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  progressPillTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  progressPill: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    borderRadius: 80,
    borderColor: Palette.textBrand,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressPillSmall: {
    width: PILL_WIDTH_SMALL,
  },

  progressPillLarge: {
    width: PILL_WIDTH_LARGE,
  },

  progressPillText: {
    color: Palette.textBrand,
    textAlign: 'center',
  },

  desktopFabContainer: {
    position: 'absolute',
    bottom: 0,
    right: `calc(50vw - ${Dimensions.desktopMiddleWidth.px} * 0.5)`,
  },
});
