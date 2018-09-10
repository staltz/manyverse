/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import {StateSource, Reducer} from 'cycle-onionify';
import {ReactElement} from 'react';
import isolate from '@cycle/isolate';
import {ReactSource} from '@cycle/react';
import {Command as AlertCommand} from 'cycle-native-alert';
import {Toast, Duration as ToastDuration} from '../../drivers/toast';
import {NetworkSource} from '../../drivers/network';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource, Req} from '../../drivers/ssb';
import {publicTab, Sinks as PublicTabSinks} from './public-tab/index';
import {
  connectionsTab,
  Sinks as ConnectionsTabSinks,
} from './connections-tab/index';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import model, {
  State,
  publicTabLens,
  connectionsTabLens,
  topBarLens,
} from './model';
import view from './view';
import navigation from './navigation';
import sampleCombine from 'xstream/extra/sampleCombine';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  network: NetworkSource;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  alert: Stream<AlertCommand>;
  onion: Stream<Reducer<any>>;
  ssb: Stream<Req>;
  toast: Stream<Toast>;
};

export const navOptions = {
  topBar: {
    visible: false,
    drawBehind: true,
    hideOnScroll: false,
    animate: false,
    borderHeight: 0,
    elevation: 0,
    height: 0,
  },
};

export function central(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, {
    '*': 'topBar',
    onion: topBarLens,
  })(sources);

  const actions = intent(sources.screen, sources.navigation);

  const scrollToTop$ = actions.changeTab$
    .compose(sampleCombine(sources.onion.state$))
    .filter(([i, state]) => state.currentTab === 0 && i === 0)
    .mapTo(null);

  const fabPress$: Stream<string> = sources.screen
    .select('fab')
    .events('pressItem');

  const publicTabSinks: PublicTabSinks = isolate(publicTab, {
    onion: publicTabLens,
    '*': 'publicTab',
  })({...sources, scrollToTop: scrollToTop$, fab: fabPress$});

  const connectionsTabSinks: ConnectionsTabSinks = isolate(connectionsTab, {
    onion: connectionsTabLens,
    '*': 'connectionsTab',
  })({...sources, fab: fabPress$});

  const fabProps$ = sources.onion.state$
    .map(
      state =>
        state.currentTab === 0 ? publicTabSinks.fab : connectionsTabSinks.fab,
    )
    .flatten();

  const command$ = navigation(
    {openDrawer$: topBarSinks.menuPress},
    xs.merge(publicTabSinks.navigation, connectionsTabSinks.navigation),
  );

  const centralReducer$ = model(actions, sources.ssb);

  const reducer$ = xs.merge(
    centralReducer$,
    publicTabSinks.onion,
    connectionsTabSinks.onion,
  ) as Stream<Reducer<State>>;

  const vdom$ = view(
    sources.onion.state$,
    fabProps$,
    topBarSinks.screen,
    publicTabSinks.screen,
    connectionsTabSinks.screen,
  );

  const toast$: Stream<Toast> = sources.ssb.acceptInviteResponse$.map(res => {
    if (res === true)
      return {
        type: 'show' as 'show',
        message: '\u2713 Invite accepted',
        duration: ToastDuration.SHORT,
      };
    else
      return {
        type: 'show' as 'show',
        message: '\u2717 Invite rejected. Are you sure it was correct?',
        duration: ToastDuration.LONG,
      };
  });

  return {
    screen: vdom$,
    onion: reducer$,
    navigation: command$,
    alert: connectionsTabSinks.alert,
    ssb: publicTabSinks.ssb,
    toast: toast$,
  };
}
