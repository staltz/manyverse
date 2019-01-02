/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import isolate from '@cycle/isolate';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource, Req as SSBReq} from '../../drivers/ssb';
import {Command, NavSource} from 'cycle-native-navigation';
import {LifecycleEvent} from '../../drivers/lifecycle';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import model, {State, topBarLens} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  lifecycle: Stream<LifecycleEvent>;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  ssb: Stream<SSBReq>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export function pasteInvite(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, {
    '*': 'topBar',
    state: topBarLens,
  })(sources);

  const actions = intent(
    sources.screen,
    sources.navigation,
    topBarSinks.done,
    sources.state.stream,
    sources.keyboard,
    sources.lifecycle,
  );
  const vdom$ = view(topBarSinks.screen);
  const command$ = navigation(actions);
  const reducer$ = model(actions);
  const newContent$ = ssb(actions);
  const dismiss$ = xs
    .merge(actions.normalDone$, actions.dhtDone$, topBarSinks.back)
    .mapTo('dismiss' as 'dismiss');

  return {
    keyboard: dismiss$,
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    ssb: newContent$,
  };
}
