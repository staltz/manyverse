// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, ViewStyle} from 'react-native';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';

export const PROGRESS_BAR_HEIGHT = 3;
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

  progressBarContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: 0,
  } as React.CSSProperties & ViewStyle,

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
    opacity: 1,
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

  centerRight: {
    width: `calc(50vw + ${Dimensions.desktopMiddleWidth.px} * 0.5)`,
  },

  topBarLeftSection: {
    height: Dimensions.toolbarHeight,
    minHeight: Dimensions.toolbarHeight,
    backgroundColor: Palette.backgroundText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.textLine,
    '-webkit-app-region': 'drag',
  },

  appLogoContainer: {
    minWidth: Dimensions.desktopSideWidth.px,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  appLogo: {
    width: Dimensions.iconSizeNormal,
    height: Dimensions.iconSizeNormal,
    marginHorizontal: Dimensions.horizontalSpaceNormal,
  },
});
