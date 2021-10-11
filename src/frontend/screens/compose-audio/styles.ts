// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Palette.backgroundText,
  },

  audioPlayer: {
    minWidth: 300,
  },

  footer: {
    paddingBottom: 80,
    flexDirection: 'row',
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
