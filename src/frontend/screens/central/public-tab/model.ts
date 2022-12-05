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
import {FeedFilter} from '../model';

export interface State {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  selfAvatarUrl?: string;
  getPublicFeedReadable: GetReadable<ThreadSummaryWithExtras> | null;
  postsCount: number | null;
  initializedSSB: boolean;
  numOfUpdates: number;
  hasComposeDraft: boolean;
  isVisible: boolean;
  canPublishSSB: boolean;
  scrollHeaderBy: Animated.Value;
  feedType: FeedFilter | null;
  subscribedHashtags: Array<string> | null;
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
  const initialFeedTypeReducer$ = asyncStorageSource
    .getItem('publicFeedType')
    .map(
      (resultStr) =>
        function initialFeedTypeReducer(prev: State): State {
          const publicFeedType = resultStr && JSON.parse(resultStr);
          return {
            ...prev,
            feedType: publicFeedType ?? 'all',
          };
        },
    );

  const feedTypeChanged$ = state$
    .compose(dropRepeats((x, y) => x.feedType === y.feedType))
    .filter((state) => state.feedType !== null) as Stream<
    State & {feedType: NonNullable<State['feedType']>}
  >;

  const setPublicFeedReducer$ = feedTypeChanged$
    .map((state) =>
      state.feedType === 'hashtags'
        ? ssbSource.hashtagsSubscribed$
            .map((hashtags) => ssbSource.hashtagsFeed$(hashtags))
            .flatten()
        : ssbSource.publicFeed$(state.feedType === 'following'),
    )
    .flatten()
    .map(
      (getReadable) =>
        function setPublicFeedReducer(prev: State): State {
          return {
            ...prev,
            getPublicFeedReadable: getReadable,
            numOfUpdates: 0,
          };
        },
    );

  const updatePreferredReactionsReducer$ = ssbSource.preferredReactions$.map(
    (preferredReactions) =>
      function updatePreferredReactionsReducer(prev: State): State {
        return {...prev, preferredReactions};
      },
  );

  const incUpdatesReducer$ = feedTypeChanged$
    .map((state) => {
      if (state.feedType === 'hashtags') {
        return ssbSource.hashtagsSubscribed$
          .filter((hashtags) => hashtags.length > 0)
          .take(1)
          .map((hashtags) => ssbSource.hashtagLiveUpdates$(hashtags))
          .flatten();
      } else if (state.feedType === 'following') {
        return ssbSource.publicLiveUpdates$(true);
      } else if (state.feedType === 'all') {
        return ssbSource.publicLiveUpdates$(false);
      } else {
        throw new Error('Unreachable');
      }
    })
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

  return xs.merge(
    setPublicFeedReducer$,
    incUpdatesReducer$,
    updatePreferredReactionsReducer$,
    initializationDoneReducer$,
    loadLastSessionTimestampReducer$,
    getComposeDraftReducer$,
    resetUpdatesReducer$,
    initialFeedTypeReducer$,
  );
}
