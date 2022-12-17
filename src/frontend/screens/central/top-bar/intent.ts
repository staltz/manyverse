// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedFilter} from '../model';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  state$: Stream<State>,
) {
  const updatePublicTabFilters$ = reactSource
    .select('filtersRow')
    .events<FeedFilter>('filterPress');

  const updatePublicTabFiltersWithState$ = updatePublicTabFilters$.compose(
    sampleCombine(state$),
  );

  const scrollToPublicTop$ = xs.merge(
    updatePublicTabFiltersWithState$
      .filter(([feedFilter, state]) => feedFilter === state.publicTabFeedType)
      .mapTo(null),
  );

  return {
    menu$: xs.merge(
      reactSource.select('menuButton').events('press'),
      reactSource.select('menuProgress').events('press'),
    ),

    publicSearch$: reactSource.select('search').events('press'),
    feedSettings$: reactSource.select('filtersRow').events('feedSettingsPress'),

    updatePublicTabFilters$,
    scrollToPublicTop$,
  };
}
