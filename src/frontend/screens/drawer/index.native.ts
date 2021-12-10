// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command as NavCmd, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import navigation from './navigation';
import {ReactElement} from 'react';
import linking from './linking';
import {GlobalEvent} from '../../drivers/eventbus';

export interface Sources {
  screen: ReactSource;
  state: StateSource<State>;
  navigation: NavSource;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<NavCmd>;
  linking: Stream<string>;
  state: Stream<Reducer<State>>;
  globalEventBus: Stream<GlobalEvent>;
}

export function drawer(sources: Sources): Sinks {
  const globalEvents$ = xs.merge<GlobalEvent>(
    sources.navigation
      .backPress()
      .map(() => ({type: 'hardwareBackOnCentralScreen'})),
    sources.navigation
      .didAppear()
      .map(() => ({type: 'drawerToggleOnCentralScreen', open: true})),
    sources.navigation
      .didDisappear()
      .map(() => ({type: 'drawerToggleOnCentralScreen', open: false})),
  );

  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb);
  const mailto$ = linking(actions);

  return {
    screen: vdom$,
    navigation: command$,
    linking: mailto$,
    state: reducer$,
    globalEventBus: globalEvents$,
  };
}
