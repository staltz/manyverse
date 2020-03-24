/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {Reducer, StateSource} from '@cycle/state';
import {Command as AlertCommand} from 'cycle-native-alert';
import {SSBSource, Req} from '../../drivers/ssb';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import alert from './alert';
import navigation from './navigation';
import linking from './linking';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  linking: Stream<string>;
  alert: Stream<AlertCommand>;
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

export function settings(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const reducer$ = model(actions, sources.ssb);
  const vdom$ = view(sources.state.stream);
  const req$ = ssb(actions);
  const alert$ = alert(actions);
  const command$ = navigation(actions, sources.navigation);
  const links$ = linking(actions);

  return {
    screen: vdom$,
    state: reducer$,
    navigation: command$,
    ssb: req$,
    linking: links$,
    alert: alert$,
  };
}
