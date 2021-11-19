// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {State as AppState} from '../../../drivers/appstate';
import {NetworkSource} from '../../../drivers/network';
import {SSBSource} from '../../../drivers/ssb';
import intent from './intent';
import {State} from './model';
import view from './view';
import navigation from './navigation';
import floatingAction from './fab';
import model from './model';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  appstate: Stream<AppState>;
  network: NetworkSource;
  fab: Stream<string>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  fab: Stream<FabProps>;
  state: Stream<Reducer<State>>;
}

export function connectionsTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.navigation);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb, sources.appstate);
  const vdom$ = view(sources.state.stream);

  const fab$ = floatingAction(sources.state.stream);

  return {
    navigation: command$,
    screen: vdom$,
    fab: fab$,
    state: reducer$,
  };
}
