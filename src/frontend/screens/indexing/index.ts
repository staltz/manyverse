// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {SSBSource} from '~frontend/drivers/ssb';
import model, {State} from './model';
import view from './view';
import {Props} from './props';

export interface Sources {
  screen: ReactSource;
  props: Stream<Props>;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

export function indexing(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const goBack$ = xs.merge(
    sources.navigation.backPress(),
    sources.screen.select('topbar').events('pressBack'),
    sources.screen.select('extraBack').events('press'),
  );

  const reducer$ = model(sources.props, sources.ssb);

  const vdom$ = view(state$);

  const command$ = goBack$.mapTo({type: 'pop'} as Command);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
