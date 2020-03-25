/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {SharedContent} from 'cycle-native-share';
import {Command, NavSource} from 'cycle-native-navigation';
import {LifecycleEvent} from '../../drivers/lifecycle';
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
  sideMenu: {
    left: {
      enabled: false,
    },
  },
  animations: {
    push: {
      enabled: false,
    },
    pop: {
      enabled: false,
    },
  },
};

export function createInvite(sources: Sources): Sinks {
  const vdom$ = view(sources.state.stream);

  const command$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('topbar').events('pressBack'),
    )
    .map(() => ({type: 'pop'} as Command));

  const share$ = sources.screen
    .select('inviteShareButton')
    .events('press')
    .compose(sample(sources.state.stream))
    .map(state => ({
      message:
        'Connect with me on Manyverse by pasting this invite code there:\n\n' +
        state.inviteCode,
      title: 'Manyverse Invite Code',
      dialogTitle: 'Give this invite code to one friend',
    }));

  const reducer$ = model(sources.ssb);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    share: share$,
  };
}
