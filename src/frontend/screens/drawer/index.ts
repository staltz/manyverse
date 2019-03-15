/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command as NavCmd} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {Command as DialogCmd} from '../../drivers/dialogs';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import navigation from './navigation';
import {ReactElement} from 'react';
import thanksDialog from './dialog-thanks';
import aboutDialog from './dialog-about';
import bugReport from './bug-report';

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  dialog: Stream<DialogCmd>;
  screen: Stream<ReactElement<any>>;
  navigation: Stream<NavCmd>;
  linking: Stream<string>;
  state: Stream<Reducer<State>>;
};

export function drawer(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb);
  const thanksDialog$ = actions.openThanks$.mapTo(thanksDialog);
  const aboutDialog$ = actions.openAbout$.mapTo(aboutDialog);
  const dialog$ = xs.merge(thanksDialog$, aboutDialog$);
  const mailto$ = actions.emailBugReport$.mapTo(bugReport);

  return {
    dialog: dialog$,
    screen: vdom$,
    navigation: command$,
    linking: mailto$,
    state: reducer$,
  };
}
