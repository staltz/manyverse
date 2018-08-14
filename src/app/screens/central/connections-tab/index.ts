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

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import {Command as AlertCommand} from 'cycle-native-alert';
import {ReactSource} from '@cycle/react';
import {Command} from 'cycle-native-navigation';
import {WifiSource} from '../../../drivers/wifi';
import {SSBSource} from '../../../drivers/ssb';
import view from './view';
import intent from './intent';
import model, {State} from './model';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  onion: StateSource<State>;
  ssb: SSBSource;
  wifi: WifiSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  alert: Stream<AlertCommand>;
  onion: Stream<Reducer<State>>;
};

export function connectionsTab(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);
  const command$ = navigation(actions, sources.onion.state$);
  const reducer$ = model(sources.ssb, sources.wifi);
  const alert$ = actions.showLANHelp$.mapTo({
    title: 'Friends around you',
    message:
      'This list shows friends (accounts you follow) which are currently ' +
      'connected to you in the same Local Area Network, for instance the ' +
      'same Wi-Fi, so they are probably "around you".',
    buttons: [{text: 'OK', id: 'okay'}],
  });

  return {
    alert: alert$,
    navigation: command$,
    screen: vdom$,
    onion: reducer$,
  };
}
