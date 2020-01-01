/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command as NavCmd, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import navigation from './navigation';
import {ReactElement} from 'react';
import bugReport from './bug-report';

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
  navigation: NavSource;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<NavCmd>;
  linking: Stream<string>;
  state: Stream<Reducer<State>>;
};

export function drawer(sources: Sources): Sinks {
  sources.navigation.backPress().addListener({
    next: () => {
      // This "consumes" the hardware back press but
      // doesn't cause any effect in navigation, on purpose
    },
  });

  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb);
  const mailto$ = actions.emailBugReport$.mapTo(bugReport);

  return {
    screen: vdom$,
    navigation: command$,
    linking: mailto$,
    state: reducer$,
  };
}
