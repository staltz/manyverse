// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet} from 'react-native';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    backgroundColor: Palette.voidMain,
  },

  progressBasic: {
    position: 'absolute',
    zIndex: 1000,
    top: 0,
    height: '5px',
    backgroundColor: Palette.textForBackgroundBrand,
    transition: 'width 0.25s',
  },

  progressUndone: {
    left: 0,
  },

  progressDone: {
    right: 0,
  },

  progressLabel: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    transition: 'opacity 1.5s ease 1.5s',
  },

  left: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  leftMenu: {
    flex: Dimensions.desktopSideWidth.flex,
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: Dimensions.verticalSpaceLarge,
  },

  leftMenuTabButton: {
    marginBottom: Dimensions.verticalSpaceTiny,
  },

  spacer: {
    flex: 1,
  },

  myProfileButton: {
    marginTop: Dimensions.verticalSpaceTiny,
    // Width can grow depending on profile name, so we cap it:
    maxWidth: `calc(${Dimensions.desktopSideWidth.vw} - ${
      2 * Dimensions.horizontalSpaceBig
    }px)`,
  },

  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  centerAndRight: {
    flex: Dimensions.desktopMiddleWidth.flex + Dimensions.desktopSideWidth.flex,
  },

  topBarLeftSection: {
    height: Dimensions.toolbarHeight,
    minHeight: Dimensions.toolbarHeight,
    backgroundColor: Palette.brandMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  topBarRightSection: {
    position: 'absolute',
    zIndex: 1000,
    top: 0,
    right: 0,
    width: Dimensions.desktopSideWidth.vw,
    height: Dimensions.toolbarHeight,
    minHeight: Dimensions.toolbarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  syncingEstimateText: {
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    marginRight: Dimensions.horizontalSpaceNormal,
    textAlign: 'right',
  },
});
