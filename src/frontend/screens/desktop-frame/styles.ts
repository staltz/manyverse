/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    backgroundColor: Palette.voidMain,
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
    paddingTop: Dimensions.verticalSpaceLarge,
  },

  leftMenuTabButton: {
    marginBottom: Dimensions.verticalSpaceTiny,
  },

  centerAndRight: {
    flex: Dimensions.desktopMiddleWidth.flex + Dimensions.desktopSideWidth.flex,
  },

  topBarStub: {
    height: Dimensions.toolbarHeight,
    backgroundColor: Palette.brandMain,
  },
});
