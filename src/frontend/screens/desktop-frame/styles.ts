// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
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
    height: '3px',
    backgroundColor: Palette.textForBackgroundBrand,
    transition: 'width 0.25s',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  progressFlare: {
    marginRight: '0%',
    backgroundColor: Palette.brandWeakest,
    height: '100%',
    width: '9px',

    animationDuration: '1400ms',
    animationDirection: 'normal',
    animationTimingFunction: 'ease-in-out',
    animationKeyframes: [
      {
        '0%': {marginRight: '100%'},
        '100%': {marginRight: '0%'},
      },
    ],
    animationIterationCount: 'infinite',
  },

  progressFlareDone: {
    opacity: 0,
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
    minWidth: Dimensions.desktopSideWidth.px,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  leftMenu: {
    flex: 1,
    alignSelf: 'flex-end',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: Dimensions.desktopSideWidth.px,
    paddingVertical: Dimensions.verticalSpaceLarge,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
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
    maxWidth: `calc(${Dimensions.desktopSideWidth.px} - ${
      2 * Dimensions.horizontalSpaceNormal
    }px)`,
  },

  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  extraButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceSmall,
  },

  extraButtonIdle: {
    backgroundColor: Palette.backgroundCTA,
    borderRadius: Dimensions.borderRadiusFull,
    marginBottom: Dimensions.verticalSpaceTiny,
  },

  extraButtonHovered: {
    backgroundColor: Palette.backgroundCTAWeak,
    borderRadius: Dimensions.borderRadiusFull,
    marginBottom: Dimensions.verticalSpaceTiny,
  },

  extraButtonIcon: {
    userSelect: 'none',
  } as any,

  extraButtonText: {
    marginLeft: Dimensions.horizontalSpaceSmall,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
  },

  centerAndRight: {
    width: `calc(50vw + ${Dimensions.desktopMiddleWidth.px} * 0.5)`,
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
    width: `calc(100vw - ${Dimensions.desktopMiddleWidth.px} - ${Dimensions.desktopSideWidth.px})`,
    height: Dimensions.toolbarHeight,
    minHeight: Dimensions.toolbarHeight,
    maxHeight: Dimensions.toolbarHeight,
    overflow: 'hidden',
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
