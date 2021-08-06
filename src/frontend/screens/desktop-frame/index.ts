/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {GlobalEvent} from '../../drivers/eventbus';
import {SSBSource} from '../../drivers/ssb';
import model, {State} from './model';
import view from './view';
import intent from './intent';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  children: Stream<Array<ReactElement>>;
  globalEventBus: Stream<GlobalEvent>;
  ssb: SSBSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  globalEventBus: Stream<GlobalEvent>;
}

export function desktopFrame(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(sources.screen, state$);

  const event$ = xs.merge(
    actions.changeTab$.map(
      (tab) => ({type: 'changeCentralTab', tab} as GlobalEvent),
    ),

    actions.scrollToTop$.map(
      (tab) => ({type: 'scrollToTopCentral', tab} as GlobalEvent),
    ),
  );

  const localizationLoaded$ = sources.globalEventBus
    .filter((ev) => ev.type === 'localizationLoaded')
    .take(1)
    .mapTo(true);

  const reducer$ = model(actions, sources.ssb);

  const vdom$ = view(state$, sources.children, localizationLoaded$);

  const command$ = xs.never(); // TODO

  return {
    screen: vdom$,
    state: reducer$,
    navigation: command$,
    globalEventBus: event$,
  };
}
