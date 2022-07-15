// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {blobsOptToStorage, blobsStorageOptions, State} from './model';
import sampleCombine from 'xstream/extra/sampleCombine';

export default function intent(
  screenSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
) {
  return {
    goBack$: xs.merge(
      navSource.backPress(),
      screenSource.select('topbar').events('pressBack'),
    ),

    updateBlobsStorage$: screenSource
      .select('blobs-storage')
      .events('change')
      .map((i) => blobsOptToStorage(blobsStorageOptions[i])),

    goToProfile$: screenSource.select('list').events<FeedId>('pressAccount'),

    manageAccount$: screenSource
      .select('list')
      .events<FeedId>('pressAccountMore')
      .compose(sampleCombine(state$))
      .map(([feedId, state]) => ({feedId, selfFeedId: state.selfFeedId})),
  };
}
