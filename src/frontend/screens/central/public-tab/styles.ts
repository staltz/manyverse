/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../global-styles/dimens';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceBig * 2,
  },

  feed: {
    paddingTop: Dimens.toolbarHeight, // for the topBar
  },

  feedInner: {
    paddingBottom: Dimens.toolbarHeight + Dimens.verticalSpaceNormal,
  },
});
