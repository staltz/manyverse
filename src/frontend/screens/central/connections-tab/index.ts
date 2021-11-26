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
import {DialogSource} from '../../../drivers/dialogs';
import {WindowSize} from '../../../drivers/window-size';
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
  );
  const vdom$ = view(state$);

  const fab$ = floatingAction(state$);

  const link$ = actions.goToHostSsbRoomDialog$.mapTo(
    'https://www.manyver.se/faq/admin-room',
  );

  return {
    navigation: command$,
    screen: vdom$,
    fab: fab$,
    linking: link$,
    state: reducer$,
  };
}
