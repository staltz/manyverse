// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {globalStyles} from '../../global-styles/styles';

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: globalStyles.containerWithDesktopSideBar,

  innerContainer: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  bioArea: {
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
  },
});
