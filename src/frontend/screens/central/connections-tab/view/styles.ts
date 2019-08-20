/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../../global-styles/dimens';
import {Palette} from '../../../../global-styles/palette';
import {Typography} from '../../../../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.backgroundVoid,
    alignSelf: 'stretch',
    flex: 1,
  },

  modesContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimens.verticalSpaceBig,
    paddingHorizontal: Dimens.horizontalSpaceBig,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },

  modeLoading: {
    position: 'absolute',
    left: -8.9,
    top: -8,
    zIndex: -2,
  },

  modeTouchable: {
    borderRadius: 30,
    padding: 6,
  },

  emptySection: {
    marginTop: Dimens.verticalSpaceBig * 2,
  },

  menuOptionContent: {
    paddingHorizontal: Dimens.horizontalSpaceBig,
    paddingVertical: Dimens.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuOptionContentText: {
    fontFamily: Typography.fontFamilyReadableText,
    marginLeft: Dimens.horizontalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
  },
});
