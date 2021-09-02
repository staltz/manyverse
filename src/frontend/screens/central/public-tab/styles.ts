/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform, StyleSheet} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Dimensions as Dimens} from '../../../global-styles/dimens';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceLarger,
    ...Platform.select({
      web: {
        maxWidth: Dimens.desktopMiddleWidth.vw,
      },
    }),
  },

  feed: {
    // for the topBar
    paddingTop: Platform.select({
      default: Dimens.toolbarHeight - getStatusBarHeight(true),

      // dirty hack because `styles.feed` is used twice in react-native-web
      web: Dimens.toolbarHeight * 0.5,
    }),
  },

  feedInner: {
    paddingBottom: Dimens.toolbarHeight + Dimens.verticalSpaceNormal,
  },
});
