// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, ViewStyle} from 'react-native';
import {Dimensions} from './dimens';
import {Palette} from './palette';

export const globalStyles = {
  noMargin: {
    margin: 0,
  } as ViewStyle,

  screen: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.voidMain,
  } as ViewStyle,

  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.voidMain,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  } as ViewStyle,

  containerWithDesktopSideBar: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        maxWidth: `calc(100vw - ${Dimensions.desktopSideWidth.px})`,
      },
    }),
  } as ViewStyle,
};
