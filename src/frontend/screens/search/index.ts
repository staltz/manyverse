/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource} from '../../drivers/ssb';
import intent from './intent';
import view from './view';
import model, {State} from './model';
import navigation from './navigation';
import {Props as P} from './props';

export type Props = P;

export interface Sources {
  screen: ReactSource;
  props: Stream<Props>;
  navigation: NavSource;
  ssb: SSBSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  keyboard: Stream<'dismiss'>;
  state: Stream<Reducer<State>>;
}

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

export function search(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(sources.navigation, sources.screen);
  const reducer$ = model(sources.props, state$, sources.ssb, actions);
  const vdom$ = view(state$);
  const command$ = navigation(actions, state$);
  const dismissKeyboard$ = xs
    .merge(actions.goBack$, actions.goToThread$)
    .mapTo('dismiss' as const);

  return {
    screen: vdom$,
    keyboard: dismissKeyboard$,
    navigation: command$,
    state: reducer$,
  };
}
