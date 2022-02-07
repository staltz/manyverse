// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform} from 'react-native';
import {isIPhoneWithMonobrow} from 'react-native-status-bar-height';

const desktopSideWidthFlex = 1;
const desktopMiddleWidthFlex = 3;
const desktopWidthFlexTotal = desktopMiddleWidthFlex + 2 * desktopSideWidthFlex;

export const Dimensions = {
  horizontalSpaceLarge: 26,
  horizontalSpaceBig: 16,
  horizontalSpaceNormal: 12,
  horizontalSpaceSmall: 7,
  horizontalSpaceTiny: 4,

  verticalSpaceHuge: 64,
  verticalSpaceLarger: 28,
  verticalSpaceLarge: 20,
  verticalSpaceBig: 14,
  verticalSpaceNormal: 10,
  verticalSpaceSmall: 7,
  verticalSpaceTiny: 3,

  /**
   * Space between top of the screen and the beginning of the screen title.
   */
  verticalSpaceIOSTitle: 16,

  avatarSizeBig: 92,
  avatarSizeNormal: 45,
  avatarSizeSmall: 32,
  avatarBorderRadius: 3,

  borderRadiusFull: 200,
  borderRadiusBig: 10,
  borderRadiusNormal: 3,
  borderRadiusSmall: 2,

  dotSize: 9,

  iconSizeHuge: 60,
  iconSizeLarge: 36,
  iconSizeBig: 30,
  iconSizeNormal: 24,
  iconSizeSmall: 18,
  toolbarHeight: Platform.select({
    ios: isIPhoneWithMonobrow() ? 100 : 76,
    default: 56,
  }),

  desktopSideWidth: {
    px: '180px',
  },

  desktopMiddleWidth: {
    number: 610,
    px: '610px',
    vw: `${Math.round(
      (100 * desktopMiddleWidthFlex) / desktopWidthFlexTotal,
    )}vw`,
  },
};
