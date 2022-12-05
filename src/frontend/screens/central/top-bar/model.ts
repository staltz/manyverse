// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Animated} from 'react-native';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedFilter} from '../model';

export interface State {
  currentTab: 'public' | 'private' | 'activity' | 'connections';
  scrollHeaderBy: Animated.Value;
  hasNewVersion: boolean;
  publicTabFeedType: FeedFilter | null;
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
  const initialPublicTabFeedTypeReducer$ = asyncStorageSource
    .getItem('publicFeedType')
    .map(
      (resultStr) =>
        function initialPublicTabFiltersReducer(prev: State): State {
          const publicFeedType = resultStr && JSON.parse(resultStr);
          return {
            ...prev,
            publicTabFeedType: publicFeedType ?? 'all',
          };
        },
    );

  const updatePublicTabTypeReducer$ = actions.updatePublicTabFilters$.map(
    (feedFilter) =>
      function updatePublicTabFiltersReducer(prev: State): State {
        if (prev.publicTabFeedType === feedFilter) {
          return prev;
        } else {
          return {
            ...prev,
            publicTabFeedType: feedFilter,
          };
        }
      },
  );

  return xs.merge(
    initialPublicTabFeedTypeReducer$,
    updatePublicTabTypeReducer$,
  );
}
