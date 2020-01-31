/* Copyright (C) 2018-2020 The Manyverse Authors.
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
      .select('connections-tab-button')
      .events('press')
      .mapTo('connections' as TabID),
  );

  const changeTabWithState$ = changeTab$.compose(sampleCombine(state$));

  const scrollToPublicTop$ = changeTabWithState$
    .filter(
      ([nextTab, state]) =>
        state.currentTab === 'public' && nextTab === 'public',
    )
    .mapTo(null);

  const scrollToPrivateTop$ = changeTabWithState$
    .filter(
      ([nextTab, state]) =>
        state.currentTab === 'private' && nextTab === 'private',
    )
    .mapTo(null);

  return {
    changeTab$,
    scrollToPublicTop$,
    scrollToPrivateTop$,
  };
}
