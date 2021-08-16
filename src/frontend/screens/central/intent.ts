/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {ReactSource} from '@cycle/react';
import {State} from './model';
import {
  GlobalEvent,
  DrawerToggleOnCentralScreen,
  CentralChangeTab,
  CentralScrollToTop,
  CentralScreenUpdate,
} from '../../drivers/eventbus';
import sample from 'xstream-sample';

type TabID = State['currentTab'];

export default function intent(
  reactSource: ReactSource,
  globalEventBus: Stream<GlobalEvent>,
  state$: Stream<State>,
) {
  const centralScreenUpdate$ = globalEventBus.filter(
    (event) => event.type === 'centralScreenUpdate',
  ) as Stream<CentralScreenUpdate>;

  const changeTab$ = xs.merge(
    centralScreenUpdate$
      .filter((event) => event.subtype === 'changeTab')
      .map((event) => (event as CentralChangeTab).tab),

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

  const globalScrollToTop$ = centralScreenUpdate$
    .filter((event) => event.subtype === 'scrollToTop')
    .map((event) => (event as CentralScrollToTop).tab);

  const changeTabWithState$ = changeTab$.compose(sampleCombine(state$));

  const scrollToPublicTop$ = xs.merge(
    changeTabWithState$
      .filter(
        ([nextTab, state]) =>
          state.currentTab === 'public' && nextTab === 'public',
      )
      .mapTo(null),

    globalScrollToTop$.filter((tab) => tab === 'public').mapTo(null),
  );

  const scrollToPrivateTop$ = xs.merge(
    changeTabWithState$
      .filter(
        ([nextTab, state]) =>
          state.currentTab === 'private' && nextTab === 'private',
      )
      .mapTo(null),

    globalScrollToTop$.filter((tab) => tab === 'private').mapTo(null),
  );

  const scrollToActivityTop$ = xs.merge(
    changeTabWithState$
      .filter(
        ([nextTab, state]) =>
          state.currentTab === 'activity' && nextTab === 'activity',
      )
      .mapTo(null),

    globalScrollToTop$.filter((tab) => tab === 'private').mapTo(null),
  );

  const hardwareBackWithState$ = globalEventBus
    .filter((event) => event.type === 'hardwareBackOnCentralScreen')
    .compose(sample(state$));

  const closeDrawer$ = hardwareBackWithState$
    .filter((state) => state.isDrawerOpen)
    .mapTo(null);

  const backToPublicTab$ = hardwareBackWithState$
    .filter((state) => !state.isDrawerOpen && state.currentTab !== 'public')
    .mapTo(null);

  const exitApp$ = hardwareBackWithState$
    .filter((state) => !state.isDrawerOpen && state.currentTab === 'public')
    .mapTo(null);

  const drawerToggled$ = globalEventBus
    .filter(
      (event): event is DrawerToggleOnCentralScreen =>
        event.type === 'drawerToggleOnCentralScreen',
    )
    .map((event) => event.open);

  return {
    changeTab$,
    scrollToPublicTop$,
    scrollToPrivateTop$,
    scrollToActivityTop$,
    closeDrawer$,
    backToPublicTab$,
    exitApp$,
    drawerToggled$,
  };
}
