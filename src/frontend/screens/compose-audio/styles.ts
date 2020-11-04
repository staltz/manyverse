/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
