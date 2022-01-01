// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
    paddingTop: Dimens.toolbarHeight - getStatusBarHeight(true),
  },

  feedInner: {
    paddingBottom: Dimens.toolbarHeight + Dimens.verticalSpaceNormal,
    ...Platform.select({
      web: {
        // Dirty hack to fix positioning of the scrollbar
        marginTop: -Dimens.toolbarHeight,
      },
    }),
  },
});
