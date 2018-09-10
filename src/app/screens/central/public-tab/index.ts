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
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {SSBSource, Req} from '../../../drivers/ssb';
import intent from './intent';
import view from './view';
import model, {State} from './model';
import ssb from './ssb';
import floatingAction from './fab';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  onion: StateSource<State>;
  ssb: SSBSource;
  scrollToTop: Stream<any>;
  fab: Stream<string>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  fab: Stream<FabProps>;
};

export function publicTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.fab);
  const vdom$ = view(sources.onion.state$, sources.ssb, sources.scrollToTop);
  const command$ = navigation(actions, sources.onion.state$);
  const reducer$ = model(sources.onion.state$, actions, sources.ssb);
  const fabProps$ = floatingAction(sources.onion.state$);
  const newContent$ = ssb(actions);

  return {
    screen: vdom$,
    navigation: command$,
    onion: reducer$,
    ssb: newContent$,
    fab: fabProps$,
  };
}
