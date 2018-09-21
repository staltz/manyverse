/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import isolate from '@cycle/isolate';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from 'cycle-onionify';
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
  onion: StateSource<State>;
  ssb: SSBSource;
  share: Stream<any>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
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

  const vdom$ = view(sources.onion.state$, topBarSinks.screen);
  const command$ = xs
    .merge(sources.navigation.backPress(), topBarSinks.back)
    .map(() => ({type: 'dismissOverlay'} as Command));
  const reducer$ = model(sources.ssb);
  const share$ = topBarSinks.share
    .compose(sample(sources.onion.state$))
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
    onion: reducer$,
    share: share$,
  };
}
