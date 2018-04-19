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

import xs, {Stream} from 'xstream';
import {StateSource, Reducer} from 'cycle-onionify';
import isolate from '@cycle/isolate';
import {ScreenVNode, Command, ScreensSource} from 'cycle-native-navigation';
import {Content} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {Screens} from '../..';
import {publicTab, Sinks as PublicTabSinks} from './public-tab/index';
import {syncTab} from './sync-tab/index';
import intent from './intent';
import model, {publicTabLens} from './model';
import view from './view';
import navigation from './navigation';
import {navigatorStyle} from './styles';

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

export const navOptions = () => ({
  screen: Screens.Central,
  navigatorStyle,
});

export function central(sources: Sources): Sinks {
  const publicTabSinks: PublicTabSinks = isolate(publicTab, {
    onion: publicTabLens,
    '*': 'publicTab',
  })(sources);
  const syncTabSinks = syncTab(sources);

  const actions = intent(sources.screen);
  const command$ = navigation(actions, publicTabSinks.navigation);
  const centralReducer$ = model(actions);
  const reducer$ = xs.merge(centralReducer$, publicTabSinks.onion);
  const vdom$ = view(
    sources.onion.state$,
    publicTabSinks.screen,
    syncTabSinks.screen,
  );

  return {
    screen: vdom$,
    onion: reducer$,
    navigation: command$,
    ssb: publicTabSinks.ssb,
  };
}
