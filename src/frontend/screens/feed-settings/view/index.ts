// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {FlatList, StyleSheet, View} from 'react-native';
import {t} from 'i18n-js';
import {globalStyles} from '~frontend/global-styles/styles';
import TopBar from '~frontend/components/TopBar';
import AnimatedLoading from '~frontend/components/AnimatedLoading';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import StatusBarBlank from '~frontend/components/StatusBarBlank';
import {State} from '../model';
import ListItem from './ListItem';
import Header from './Header';

class TypedFlatList extends FlatList<[string, boolean]> {}

const styles = StyleSheet.create({
  screen: globalStyles.screen,
  scrollContainer: globalStyles.containerWithDesktopSideBar,
  separator: {
    height: Dimensions.verticalSpaceBig,
  },
  hashtagListContainer: {
    borderTopWidth: 1,
    borderTopColor: Palette.voidMain,
  },
});

export default function view(state$: Stream<State>) {
  return state$
    .compose(
      dropRepeatsByKeys([
        'selfFeedId',
        'hashtags',
        'lastSessionTimestamp',
        'publicFeedType',
      ]),
    )
    .map((state) => {
      const hashtagsData =
        state.hashtags === null
          ? []
          : Array.from(state.hashtags).sort(([a], [b]) => a.localeCompare(b));

      return h(View, {style: styles.screen}, [
        h(StatusBarBlank),
        h(TopBar, {sel: 'topbar', title: t('feed_settings.title')}),
        h(View, {style: styles.scrollContainer}, [
          h(TypedFlatList, {
            ListEmptyComponent:
              state.hashtags === null
                ? h(AnimatedLoading, {text: t('central.loading')})
                : undefined,
            ListHeaderComponent: h(Header, {
              sel: 'feedSettingsHeader',
              activePublicFeedType: state.publicFeedType,
              hasHashtagSubscriptions: hashtagsData.length > 0,
            }),
            data: hashtagsData,
            keyExtractor: ([hashtag]) => hashtag,
            renderItem: ({item: [hashtag, isSubscribed]}) =>
              h(ListItem, {sel: 'hashtagRow', hashtag, isSubscribed}),
            style: styles.hashtagListContainer,
          }),
        ]),
      ]);
    });
}
