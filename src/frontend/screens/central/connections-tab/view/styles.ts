/* Copyright (C) 2018-2020 The Manyverse Authors.
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
    marginTop: Dimens.toolbarHeight, // for the topBar
    alignSelf: 'stretch',
    flex: 1,
  },

  containerInner: {
    paddingBottom: Dimens.verticalSpaceNormal,
    minHeight: 400,
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

  emptySectionContainer: {
    position: 'absolute',
    zIndex: -1,
    top:
      Dimens.toolbarHeight /* approximately the modesContainer height */ +
      Dimens.verticalSpaceBig * 2,
    left: 0,
    right: 0,
    bottom: 0,
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
    marginLeft: Dimens.horizontalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },
});
