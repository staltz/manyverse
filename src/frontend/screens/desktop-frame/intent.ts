/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {ReactSource} from '@cycle/react';
import {State} from './model';

type TabID = State['currentTab'];

export default function intent(
  reactSource: ReactSource,
  state$: Stream<State>,
) {
  const changeTab$ = xs.merge(
    reactSource
      .select('public-tab-button')
      .events('press')
      .mapTo('public' as TabID),

    reactSource
      .select('private-tab-button')
      .events('press')
      .mapTo('private' as TabID),

    reactSource
      .select('activity-tab-button')
      .events('press')
      .mapTo('activity' as TabID),

    reactSource
      .select('connections-tab-button')
      .events('press')
      .mapTo('connections' as TabID),
  );

  const changeTabWithState$ = changeTab$.compose(sampleCombine(state$));

  const scrollToTop$ = changeTabWithState$
    .filter(([nextTab, state]) => nextTab === state.currentTab)
    .map(([nextTab]) => nextTab);

  return {
    changeTab$,
    scrollToTop$,
  };
}
