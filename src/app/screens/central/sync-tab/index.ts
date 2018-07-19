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
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import {Command as AlertCommand} from 'cycle-native-alert';
import {ReactSource} from '@cycle/react';
import {SSBSource} from '../../../drivers/ssb';
import view from './view';
import intent from './intent';

export type Sources = {
  screen: ReactSource;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  alert: Stream<AlertCommand>;
  onion: Stream<Reducer<any>>;
};

export function syncTab(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.ssb.localSyncPeers$.startWith([]));
  const reducer$ = xs.empty();
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
    screen: vdom$,
    onion: reducer$,
  };
}
