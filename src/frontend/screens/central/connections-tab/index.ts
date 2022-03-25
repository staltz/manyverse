// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {State as AppState} from '~frontend/drivers/appstate';
import {NetworkSource} from '~frontend/drivers/network';
import {SSBSource} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import {WindowSize} from '~frontend/drivers/window-size';
import intent from './intent';
import {State} from './model';
import view from './view';
import navigation from './navigation';
import floatingAction from './fab';
import model from './model';
import {FabProps} from '../fab';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  appstate: Stream<AppState>;
  network: NetworkSource;
  dialog: DialogSource;
  windowSize: Stream<WindowSize>;
  fab: Stream<string>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  fab: Stream<FabProps>;
  linking: Stream<string>;
  state: Stream<Reducer<State>>;
}

export function connectionsTab(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(
    sources.screen,
    sources.dialog,
    sources.navigation,
    state$,
  );
  const command$ = navigation(actions, state$);
  const reducer$ = model(
    sources.ssb,
    sources.network,
    sources.appstate,
    sources.windowSize,
    state$,
  );
  const vdom$ = view(state$);

  const fab$ = floatingAction(state$);

  const link$ = actions.goToHostSsbRoomDialog$;

  return {
    navigation: command$,
    screen: vdom$,
    fab: fab$,
    linking: link$,
    state: reducer$,
  };
}
