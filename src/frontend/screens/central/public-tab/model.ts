// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId} from 'ssb-typescript';
import {SSBSource, GetReadable} from '../../../drivers/ssb';
import {ThreadSummaryWithExtras} from '../../../ssb/types';
import {Animated} from 'react-native';

export interface State {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  selfAvatarUrl?: string;
  getPublicFeedReadable: GetReadable<ThreadSummaryWithExtras> | null;
  initializedSSB: boolean;
  numOfUpdates: number;
  hasComposeDraft: boolean;
  isVisible: boolean;
  canPublishSSB: boolean;
  scrollHeaderBy: Animated.Value;
}

export interface Actions {
  refreshFeed$: Stream<any>;
  refreshComposeDraft$: Stream<any>;
  initializationDone$: Stream<any>;
}

export default function model(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const setPublicFeedReducer$ = ssbSource.publicFeed$.map(
    (getReadable) =>
      function setPublicFeedReducer(prev: State): State {
        return {...prev, getPublicFeedReadable: getReadable};
      },
  );

  const incUpdatesReducer$ = ssbSource.publicLiveUpdates$.mapTo(
    function incUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: prev.numOfUpdates + 1};
    },
  );

  const initializationDoneReducer$ = actions.initializationDone$.mapTo(
    function initializationDoneReducer(prev: State): State {
      return {...prev, initializedSSB: true};
    },
  );

  const resetUpdatesReducer$ = actions.refreshFeed$.mapTo(
    function resetUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: 0};
    },
  );

  const loadLastSessionTimestampReducer$ = actions.refreshFeed$
    .startWith(null)
    .map(() =>
      asyncStorageSource.getItem('lastSessionTimestamp').map(
        (resultStr) =>
          function lastSessionTimestampReducer(prev: State): State {
            const lastSessionTimestamp = parseInt(resultStr ?? '', 10);
            if (isNaN(lastSessionTimestamp)) {
              return prev;
            } else {
              return {...prev, lastSessionTimestamp};
            }
          },
      ),
    )
    .flatten();

  const getComposeDraftReducer$ = actions.refreshComposeDraft$
    .map(() => asyncStorageSource.getItem('composeDraft'))
    .flatten()
    .map(
      (composeDraft) =>
        function getComposeDraftReducer(prev: State): State {
          return {...prev, hasComposeDraft: !!composeDraft};
        },
    );

  return xs.merge(
    setPublicFeedReducer$,
    incUpdatesReducer$,
    initializationDoneReducer$,
    loadLastSessionTimestampReducer$,
    getComposeDraftReducer$,
    resetUpdatesReducer$,
  );
}
