// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource} from '~frontend/drivers/ssb';
import {State} from './model';
import model from './model';
import view from './view';
import intent from './intent';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
  navigation: NavSource;
  ssb: SSBSource;
  scrollToTop: Stream<any>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
};

export function activityTab(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const reducer$ = model(sources.ssb, actions);
  const cmd$ = navigation(actions, sources.state.stream);
  const vdom$ = view(sources.state.stream, sources.scrollToTop);

  return {
    screen: vdom$,
    navigation: cmd$,
    state: reducer$,
  };
}
