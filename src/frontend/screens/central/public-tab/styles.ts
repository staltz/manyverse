// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import ThreadCard from '~frontend/components/ThreadCard';
import {Dimensions} from '~frontend/global-styles/dimens';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimensions.verticalSpaceLarger,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
        maxWidth: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  feed: {
    // for the topBar
    paddingTop: Dimensions.toolbarHeight - getStatusBarHeight(true),
    ...Platform.select({
      web: {
        maxWidth: `calc(100vw - ${Dimensions.desktopSideWidth.px})`,
      },
    }),
  },

  feedInner: {
    paddingBottom: Dimensions.tabBarHeight + ThreadCard.HEIGHT * 0.5,
    ...Platform.select({
      web: {
        marginTop:
          // The negative part is a hack to fix positioning of the scrollbar
          -Dimensions.toolbarHeight + Dimensions.filtersRowHeight,
      },
      default: {
        marginTop: Dimensions.filtersRowHeight,
      },
    }),
  },
});
