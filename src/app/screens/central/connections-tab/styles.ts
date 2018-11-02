/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.brand.voidBackground,
    alignSelf: 'stretch',
    flex: 1,
  },

  modesContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.brand.textBackground,
    paddingVertical: Dimens.verticalSpaceBig,
    paddingHorizontal: Dimens.horizontalSpaceBig,
    marginBottom: Dimens.verticalSpaceNormal,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },

  modeTouchable: {
    borderRadius: 30,
    padding: 6,
  },

  emptySection: {
    marginTop: Dimens.verticalSpaceBig * 2,
  },

  connectionsList: {
    marginBottom: Dimens.verticalSpaceNormal,
  },
});

export const iconProps = {
  info: {
    size: Dimens.iconSizeSmall,
    color: Palette.brand.darkTextWeak,
  },
};
