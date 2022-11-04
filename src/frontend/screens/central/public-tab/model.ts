// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {Reducer} from '@cycle/state';
import {Animated} from 'react-native';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId} from 'ssb-typescript';
import {SSBSource, GetReadable} from '~frontend/drivers/ssb';
import {ThreadSummaryWithExtras} from '~frontend/ssb/types';

export interface State {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  selfAvatarUrl?: string;
  getPublicFeedReadable: GetReadable<ThreadSummaryWithExtras> | null;
  initializedSSB: boolean;
  numOfUpdates: number;
  hasComposeDraft: boolean;
  isVisible: boolean;
  canPublishSSB: boolean;
  scrollHeaderBy: Animated.Value;
  followingOnly: boolean | null;
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
  state$: Stream<State>,
): Stream<Reducer<State>> {
  const followingOnlyChanged$ = state$
    .compose(dropRepeats((x, y) => x.followingOnly === y.followingOnly))
    .filter((state) => state.followingOnly !== null) as Stream<
    State & {followingOnly: boolean}
  >;

  const setPublicFeedReducer$ = followingOnlyChanged$
    .map((state) => ssbSource.publicFeed$(state.followingOnly))
    .flatten()
    .map(
      (getReadable) =>
        function setPublicFeedReducer(prev: State): State {
          return {...prev, getPublicFeedReadable: getReadable};
        },
    );

  const updatePreferredReactionsReducer$ = ssbSource.preferredReactions$.map(
    (preferredReactions) =>
      function updatePreferredReactionsReducer(prev: State): State {
        return {...prev, preferredReactions};
      },
  );

  const incUpdatesReducer$ = followingOnlyChanged$
    .map((state) => ssbSource.publicLiveUpdates$(state.followingOnly))
    .flatten()
    .mapTo(function incUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: prev.numOfUpdates + 1};
    });

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

  const initialFollowingOnlyReducer$ = asyncStorageSource
    .getItem('followingOnly')
    .map(
      (resultStr) =>
        function initialPublicTabFiltersReducer(prev: State): State {
          const parsed = resultStr && JSON.parse(resultStr);
          return {
            ...prev,
            followingOnly: parsed === null ? false : parsed,
          };
        },
    );

  return xs.merge(
    setPublicFeedReducer$,
    incUpdatesReducer$,
    updatePreferredReactionsReducer$,
    initializationDoneReducer$,
    loadLastSessionTimestampReducer$,
    getComposeDraftReducer$,
    resetUpdatesReducer$,
    initialFollowingOnlyReducer$,
  );
}
