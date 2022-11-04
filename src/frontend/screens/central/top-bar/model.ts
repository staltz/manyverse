// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Animated} from 'react-native';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';

export type FeedFilter = 'all' | 'following';

export interface State {
  currentTab: 'public' | 'private' | 'activity' | 'connections';
  scrollHeaderBy: Animated.Value;
  hasNewVersion: boolean;
  publicTabFollowingOnly: boolean | null;
}

export interface Actions {
  menu$: Stream<any>;
  publicSearch$: Stream<any>;
  updatePublicTabFilters$: Stream<FeedFilter>;
}

export default function model(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
): Stream<Reducer<State>> {
  const initialPublicTabFiltersReducer$ = asyncStorageSource
    .getItem('followingOnly')
    .map(
      (resultStr) =>
        function initialPublicTabFiltersReducer(prev: State): State {
          const parsed = resultStr && JSON.parse(resultStr);
          return {
            ...prev,
            publicTabFollowingOnly: parsed === null ? false : parsed,
          };
        },
    );

  const updatePublicTabFiltersReducer$ = actions.updatePublicTabFilters$.map(
    (feedFilter) =>
      function updatePublicTabFiltersReducer(prev: State): State {
        const publicTabFollowingOnly = feedFilter === 'following';

        if (publicTabFollowingOnly === prev.publicTabFollowingOnly) {
          return prev;
        } else {
          return {
            ...prev,
            publicTabFollowingOnly,
          };
        }
      },
  );

  return xs.merge(
    initialPublicTabFiltersReducer$,
    updatePublicTabFiltersReducer$,
  );
}
