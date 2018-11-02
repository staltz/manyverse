/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from '@cycle/state';
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
  state: StateSource<State>;
  network: NetworkSource;
  ssb: SSBSource;
  fab: Stream<string>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  alert: Stream<AlertCommand>;
  state: Stream<Reducer<State>>;
  fab: Stream<FabProps>;
};

export function connectionsTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.fab);
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.state.stream, sources.ssb, sources.network);
  const fabProps$ = floatingAction(sources.state.stream);
  const alert$ = alert(actions, sources.state.stream);

  return {
    alert: alert$,
    navigation: command$,
    screen: vdom$,
    state: reducer$,
    fab: fabProps$,
  };
}
