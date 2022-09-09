// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {HTTPSource, RequestInput as HTTPReq} from '@cycle/http';
import {Command, NavSource, StackElement} from 'cycle-native-navigation';
import {GlobalEvent} from '~frontend/drivers/eventbus';
import {SSBSource} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import linking from '~frontend/screens/drawer/linking';
import {LocalizationSource} from '~frontend/drivers/localization';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import navigation from './navigation';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  http: HTTPSource;
  navigationStack: StateSource<Array<StackElement>>;
  children: Stream<Array<ReactElement>>;
  localization: LocalizationSource;
  globalEventBus: Stream<GlobalEvent>;
  ssb: SSBSource;
  dialog: DialogSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  http: Stream<HTTPReq>;
  state: Stream<Reducer<State>>;
  globalEventBus: Stream<GlobalEvent>;
  linking: Stream<string>;
}

export function desktopFrame(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(sources.screen, sources.dialog, sources.http, state$);

  const event$ = xs.merge(
    actions.changeTab$.map(
      (tab) =>
        ({
          type: 'centralScreenUpdate',
          subtype: 'changeTab',
          tab,
        } as GlobalEvent),
    ),

    actions.scrollToTop$.map(
      (tab) =>
        ({
          type: 'centralScreenUpdate',
          subtype: 'scrollToTop',
          tab,
        } as GlobalEvent),
    ),
  );

  const reducer$ = model(
    actions,
    sources.navigation,
    sources.globalEventBus,
    sources.ssb,
  );

  const vdom$ = view(state$, sources.children, sources.localization);

  const command$ = navigation(actions, state$, sources.navigationStack.stream);

  const linking$ = linking(actions);

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
    state: reducer$,
    navigation: command$,
    http: httpReq$,
    globalEventBus: event$,
    linking: linking$,
  };
}
