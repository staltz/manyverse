/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import isolate from '@cycle/isolate';
import {
  ScreenVNode,
  Command,
  PushCommand,
  ScreensSource,
} from 'cycle-native-navigation';
import {Content} from '../../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import {publicTab, Sinks as PublicTabSinks} from './public-tab/index';
import {syncTab} from './sync-tab/index';
import {navigatorStyle as profileNavigatorStyle} from '../profile/styles';
import intent, {Actions} from './intent';
import model, {publicTabLens, State} from './model';
import view from './view';
import {Tab} from './tabs/index';
import {mockScreen} from './tabs/mockTab';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<any>>;
  ssb: Stream<Content>;
};

function navigationCommands(
  actions: Actions,
  other$: Stream<Command>,
): Stream<Command> {
  const centralCommand$: Stream<Command> = actions.goToSelfProfile$.mapTo(
    {
      type: 'push',
      screen: 'mmmmm.Profile',
      navigatorStyle: profileNavigatorStyle,
      animated: true,
      animationType: 'slide-horizontal',
    } as PushCommand,
  );

  return xs.merge(centralCommand$, other$);
}

function configureTabs(
  publicTab$: Stream<ReactElement<any>>,
  privateTab$: Stream<ReactElement<any>>,
  notificationsTab$: Stream<ReactElement<any>>,
  syncTab$: Stream<ReactElement<any>>,
) {
  return xs.combine(
    publicTab$,
    privateTab$,
    notificationsTab$,
    syncTab$,
  ).map(([publicTab, privateTab, notificationsTab, syncTab]) => ([
    {
      id: 'public_tab',
      icon: 'bulletin-board',
      label: 'Public Tab',
      VDOM: publicTab,
    },
    {
      id: 'private_tab',
      icon: 'email-secure',
      label: 'Private Tab',
      VDOM: privateTab,
    },
    {
      id: 'notifications_tab',
      icon: 'numeric-0-box',
      label: 'Notifications Tab',
      VDOM: notificationsTab,
    },
    {
      id: 'sync_tab',
      icon: 'wan',
      label: 'Sync Tab',
      VDOM: syncTab,
    }
  ]));
}

export function central(sources: Sources): Sinks {
  const publicTabSinks: PublicTabSinks = isolate(publicTab, {
    onion: publicTabLens,
    '*': 'publicTab',
  })(sources);
  const syncTabSinks = syncTab(sources);

  const actions = intent(sources.screen);
  const command$ = navigationCommands(actions, publicTabSinks.navigation);
  const centralReducer$ = model(actions);
  const reducer$ = xs.merge(centralReducer$, publicTabSinks.onion);

  const tabs$ = configureTabs(
    publicTabSinks.screen,
    mockScreen('Private'),
    mockScreen('Notifications'),
    syncTabSinks.screen,
  );

  const vdom$ = view(
    sources.onion.state$,
    tabs$,
  );

  return {
    screen: vdom$,
    onion: reducer$,
    navigation: command$,
    ssb: publicTabSinks.ssb,
  };
}
