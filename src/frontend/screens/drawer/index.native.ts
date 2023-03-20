// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {HTTPSource, RequestInput as HTTPReq} from '@cycle/http';
import {StateSource, Reducer} from '@cycle/state';
import {Command as NavCmd, NavSource} from 'cycle-native-navigation';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {SSBSource} from '~frontend/drivers/ssb';
import {GlobalEvent} from '~frontend/drivers/eventbus';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import navigation from './navigation';
import linking from './linking';

export interface Sources {
  screen: ReactSource;
  state: StateSource<State>;
  navigation: NavSource;
  globalEventBus: Stream<GlobalEvent>;
  http: HTTPSource;
  ssb: SSBSource;
  asyncstorage: AsyncStorageSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<NavCmd>;
  linking: Stream<string>;
  state: Stream<Reducer<State>>;
  http: Stream<HTTPReq>;
  globalEventBus: Stream<GlobalEvent>;
}

export function drawer(sources: Sources): Sinks {
  const state$ = sources.state.stream;

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

    state$
      .map((state) => state.hasNewVersion)
      .compose(dropRepeats())
      .filter((hasNewVersion) => hasNewVersion === true)
      .map(() => ({type: 'hasNewVersion'})),
  );

  const actions = intent(sources.screen, sources.http, state$);
  const vdom$ = view(state$);
  const command$ = navigation(actions, state$);
  const reducer$ = model(
    actions,
    sources.ssb,
    sources.globalEventBus,
    state$,
    sources.asyncstorage,
  );
  const mailto$ = linking(actions);

  const httpReq$ = actions.checkNewVersion$.map(
    () =>
      ({
        url: 'https://manyver.se/latestversion',
        method: 'GET',
        accept: 'application/json',
        category: 'latestversion',
      } as HTTPReq),
  );

  return {
    screen: vdom$,
    navigation: command$,
    linking: mailto$,
    state: reducer$,
    http: httpReq$,
    globalEventBus: globalEvents$,
  };
}
