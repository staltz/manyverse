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

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import {Command as AlertCommand} from 'cycle-native-alert';
import {ReactSource} from '@cycle/react';
import {Command} from 'cycle-native-navigation';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {NetworkSource} from '../../../drivers/network';
import {SSBSource} from '../../../drivers/ssb';
import view from './view';
import intent from './intent';
import model, {State} from './model';
import floatingAction from './fab';
import alert from './alert';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  onion: StateSource<State>;
  network: NetworkSource;
  ssb: SSBSource;
  fab: Stream<string>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  alert: Stream<AlertCommand>;
  onion: Stream<Reducer<State>>;
  fab: Stream<FabProps>;
};

export function connectionsTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.fab);
  const vdom$ = view(sources.onion.state$);
  const command$ = navigation(actions, sources.onion.state$);
  const reducer$ = model(sources.onion.state$, sources.ssb, sources.network);
  const fabProps$ = floatingAction(sources.onion.state$);
  const alert$ = alert(actions, sources.onion.state$);

  return {
    alert: alert$,
    navigation: command$,
    screen: vdom$,
    onion: reducer$,
    fab: fabProps$,
  };
}
