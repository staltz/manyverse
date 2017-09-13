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
import {ScreenSource} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import {Content} from '../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import view from './view';

export type Sources = {
  screen: ScreenSource;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  onion: Stream<Reducer<any>>;
  statusBarAndroid: Stream<string>;
  ssb: Stream<Content>;
};

export function profile(sources: Sources): Sinks {
  const feed$ = sources.ssb.selfFeedId$
    .map(id => sources.ssb.profileFeed$(id))
    .flatten();

  const about$ = sources.ssb.selfFeedId$
    .map(id => sources.ssb.profileAbout$(id))
    .flatten();

  const {vdom$, statusBar$} = view(feed$, about$);

  return {
    screen: vdom$,
    onion: xs.never(),
    statusBarAndroid: statusBar$,
    ssb: xs.never()
  };
}
