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

import {Stream} from 'xstream';
import {StateSource, Reducer} from 'cycle-onionify';
import {ReactElement} from 'react';
import {FeedId} from 'ssb-typescript';
import {ReactSource} from '@cycle/react';
import {SSBSource, Req} from '../../drivers/ssb';
import {Command, NavSource} from 'cycle-native-navigation';
import isolate from '@cycle/isolate';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';

export type Props = {
  selfFeedId: FeedId;
  feedId: FeedId;
};

export type Sources = {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Req>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export function profile(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const actions = intent(sources.screen);
  const reducer$ = model(sources.props, sources.ssb);
  const vdom$ = view(sources.onion.state$, sources.ssb, topBarSinks.screen);
  const newContent$ = ssb(actions, sources.onion.state$);
  const command$ = navigation(
    actions,
    sources.navigation,
    sources.onion.state$,
    topBarSinks.back,
  );

  return {
    screen: vdom$,
    navigation: command$,
    onion: reducer$,
    ssb: newContent$,
  };
}
