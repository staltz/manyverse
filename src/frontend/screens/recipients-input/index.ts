/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import isolate from '@cycle/isolate';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {topBar, Sinks as TBSinks} from './top-bar';
import model, {State, topBarLens} from './model';
import view from './view';
import intent from './intent';
import navigation from './navigation';
import {FeedId} from 'ssb-typescript';

export type Props = {
  selfFeedId: FeedId;
};

export type Sources = {
  screen: ReactSource;
  props: Stream<Props>;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};

export function recipientsInput(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, {
    '*': 'topBar',
    state: topBarLens,
  })(sources);

  const state$ = sources.state.stream;
  const vdom$ = view(state$, topBarSinks.screen);
  const actions = intent(
    sources.screen,
    sources.navigation,
    topBarSinks.back,
    topBarSinks.next,
  );
  const reducer$ = model(sources.props, sources.ssb, actions);
  const command$ = navigation(actions, state$);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
