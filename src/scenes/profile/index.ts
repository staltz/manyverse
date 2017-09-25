/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import {Content, FeedId, About, Msg, isVoteMsg} from '../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import {ScreenVNode, Command, ScreensSource} from 'cycle-native-navigation';
import model, {State} from './model';
import view from './view';

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content>;
};

export function profile(sources: Sources): Sinks {
  const reducer$ = model(sources.onion.state$, sources.ssb);
  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    navCommand: xs.never(),
    onion: reducer$,
    ssb: xs.never()
  };
}
