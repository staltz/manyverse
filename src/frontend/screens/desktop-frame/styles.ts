// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';

const PROGRESS_BAR_HEIGHT = 3;
const PILL_WIDTH_SMALL = 46;
const PILL_WIDTH_LARGE = 56;
export const PILL_LEFT_CLAMP_MIN = `${
  PILL_WIDTH_SMALL * 0.5 + Dimensions.horizontalSpaceSmall
}px`;
export const PILL_LEFT_CLAMP_MAX = `100vw - ${
  PILL_WIDTH_LARGE * 0.5 + Dimensions.horizontalSpaceSmall
}px`;

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
    height: `${PROGRESS_BAR_HEIGHT}px`,
    backgroundColor: Palette.textForBackgroundBrand,
    transition: 'width 0.25s',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as React.CSSProperties & ViewStyle,

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
  } as React.CSSProperties & ViewStyle,

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
  } as React.CSSProperties & TextStyle,

  progressPill: {
    position: 'absolute',
    zIndex: 1000,
    top: PROGRESS_BAR_HEIGHT + Dimensions.verticalSpaceTiny,
    height: '22px',
    transition: 'left 0.25s, opacity 0.75s',
    transform: 'translateX(-50%)',
    backgroundColor: Palette.backgroundText,
    borderRadius: 80,
    borderColor: Palette.textBrand,
    borderWidth: 1,
  } as React.CSSProperties & ViewStyle,

  progressPillHovered: {
    backgroundColor: Palette.backgroundTextWeak,
  },

  progressPillSmall: {
    width: `${PILL_WIDTH_SMALL}px`,
  },

  progressPillLarge: {
    width: `${PILL_WIDTH_LARGE}px`,
  },

  progressPillText: {
    color: Palette.textBrand,
    textAlign: 'center',
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
    width: `calc(min(100vw - ${Dimensions.desktopMiddleWidth.px} - ${Dimensions.desktopSideWidth.px}, (100vw - ${Dimensions.desktopMiddleWidth.px}) * 0.5))`,
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
