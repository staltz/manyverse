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

import {Stream} from 'xstream';
import {ScreensSource, Command, ScreenVNode} from 'cycle-native-navigation';
import {StateSource, Reducer} from 'cycle-onionify';
import {Content} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {Screens} from '../..';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import {navigatorStyle} from './styles';
import navigation from './navigation';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  keyboard: Stream<'dismiss'>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content>;
};

export const navOptions = () => ({
  screen: Screens.Thread,
  navigatorStyle,
  title: 'Thread',
});

export function thread(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.onion.state$);
  const reducer$ = model(sources.onion.state$, actions, sources.ssb);
  const command$ = navigation(actions);
  const vdom$ = view(sources.onion.state$, sources.ssb, actions);
  const newContent$ = ssb(actions);
  const dismiss$ = actions.publishMsg$.mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    navigation: command$,
    keyboard: dismiss$,
    onion: reducer$,
    ssb: newContent$,
  };
}
