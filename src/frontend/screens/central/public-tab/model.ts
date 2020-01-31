/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId} from 'ssb-typescript';
import {SSBSource, GetReadable, ThreadAndExtras} from '../../../drivers/ssb';
import {Animated} from 'react-native';

export type State = {
  selfFeedId: FeedId;
  getPublicFeedReadable: GetReadable<ThreadAndExtras> | null;
  getSelfRootsReadable: GetReadable<ThreadAndExtras> | null;
  numOfUpdates: number;
  hasComposeDraft: boolean;
  isVisible: boolean;
  scrollHeaderBy: Animated.Value;
};

export type Actions = {
  resetUpdates$: Stream<any>;
  refreshComposeDraft$: Stream<any>;
};

export default function model(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const setPublicFeedReducer$ = ssbSource.publicFeed$.map(
    getReadable =>
      function setPublicFeedReducer(prev: State): State {
        return {...prev, getPublicFeedReadable: getReadable};
      },
  );

  const incUpdatesReducer$ = ssbSource.publicLiveUpdates$.mapTo(
    function incUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: prev.numOfUpdates + 1};
    },
  );

  const resetUpdatesReducer$ = actions.resetUpdates$.mapTo(
    function resetUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: 0};
    },
  );

  const getComposeDraftReducer$ = actions.refreshComposeDraft$
    .map(() => asyncStorageSource.getItem('composeDraft'))
    .flatten()
    .map(
      composeDraft =>
        function getComposeDraftReducer(prev: State): State {
          return {...prev, hasComposeDraft: !!composeDraft};
        },
    );

  const setSelfRootsReducer$ = ssbSource.selfPublicRoots$.map(
    getReadable =>
      function setSelfRootsReducer(prev: State): State {
        return {...prev, getSelfRootsReadable: getReadable};
      },
  );

  return xs.merge(
    setPublicFeedReducer$,
    setSelfRootsReducer$,
    incUpdatesReducer$,
    getComposeDraftReducer$,
    resetUpdatesReducer$,
  );
}
