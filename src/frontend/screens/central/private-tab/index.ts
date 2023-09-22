// SPDX-FileCopyrightText: 2020-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {Props as FabProps} from '~frontend/components/FloatingActionButton';
import {SSBSource} from '~frontend/drivers/ssb';
import {State} from './model';
import model from './model';
import view from './view';
import intent from './intent';
import navigation from './navigation';
import floatingAction from './fab';

export interface Sources {
  screen: ReactSource;
  state: StateSource<State>;
  navigation: NavSource;
  ssb: SSBSource;
  scrollToTop: Stream<any>;
  fab: Stream<string>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
  fab: Stream<FabProps>;
}

export function privateTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.fab);
  const reducer$ = model(sources.ssb, sources.navigation);
  const fabProps$ = floatingAction(sources.state.stream);
  const cmd$ = navigation(actions, sources.state.stream);
  const vdom$ = view(
    sources.state.stream,
    sources.ssb.privateLiveUpdates$,
    sources.scrollToTop,
  );

  return {
    screen: vdom$,
    fab: fabProps$,
    navigation: cmd$,
    state: reducer$,
  };
}
