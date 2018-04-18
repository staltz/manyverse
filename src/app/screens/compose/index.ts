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

import xs, {Stream} from 'xstream';
import {ScreensSource, Command, ScreenVNode} from 'cycle-native-navigation';
import {StateSource, Reducer} from 'cycle-onionify';
import isolate from '@cycle/isolate';
import {Content} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {Event as KeyboardEvent} from '../../drivers/keyboard';
import {Screens} from '../..';
import publishButton, {Sinks as PBSinks} from './publish-button';
import intent from './intent';
import model, {State, publishButtonLens} from './model';
import view from './view';
import ssb from './ssb';
import {navigatorStyle} from './styles';
import navigation from './navigation';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  keyboard: Stream<KeyboardEvent>;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content>;
};

export const navOptions = () => ({
  screen: Screens.Compose,
  navigatorStyle,
  navigatorButtons: {
    rightButtons: [{component: Screens.ComposePublishButton}],
  },
});

export function compose(sources: Sources): Sinks {
  const publishButtonSinks: PBSinks = isolate(publishButton, {
    '*': 'publishButton',
    onion: publishButtonLens,
  })(sources);

  const actions = intent(
    sources.screen,
    publishButtonSinks.done,
    sources.onion.state$,
    sources.keyboard,
  );
  const vdom$ = view();
  const command$ = navigation(actions);
  const reducer$ = model(actions);
  const newContent$ = ssb(actions);

  return {
    screen: xs.merge(vdom$, publishButtonSinks.screen),
    navigation: command$,
    onion: reducer$,
    ssb: newContent$,
  };
}
