// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {globalStyles} from '../../global-styles/styles';

export const styles = StyleSheet.create({
  screen: {
    ...globalStyles.screen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    ...globalStyles.container,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.backgroundText,
  },

  audioPlayer: {
    minWidth: 300,
  },

  footer: {
    paddingBottom: 80,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  discardButton: {
    minWidth: 90,
  },

  doneButton: {
    minWidth: 90,
    marginLeft: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundCTA,
  },
});
