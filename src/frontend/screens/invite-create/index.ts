/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import isolate from '@cycle/isolate';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {SharedContent} from 'cycle-native-share';
import {Command, NavSource} from 'cycle-native-navigation';
import {LifecycleEvent} from '../../drivers/lifecycle';
import {topBar, Sinks as TBSinks} from './top-bar';
import model, {State} from './model';
import view from './view';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  lifecycle: Stream<LifecycleEvent>;
  state: StateSource<State>;
  ssb: SSBSource;
  share: Stream<any>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  share: Stream<SharedContent>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export function createInvite(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const vdom$ = view(sources.state.stream, topBarSinks.screen);
  const command$ = xs
    .merge(sources.navigation.backPress(), topBarSinks.back)
    .map(() => ({type: 'dismissOverlay'} as Command));
  const reducer$ = model(sources.ssb);
  const share$ = topBarSinks.share
    .compose(sample(sources.state.stream))
    .map(state => ({
      message:
        'Connect with me on Manyverse by pasting this invite code there:\n\n' +
        state.inviteCode,
      title: 'Manyverse Invite Code',
      dialogTitle: 'Give this invite code to one friend',
    }));

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    share: share$,
  };
}
