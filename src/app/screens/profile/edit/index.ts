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
import {StateSource, Reducer} from 'cycle-onionify';
import {ScreenVNode, Command, ScreensSource} from 'cycle-native-navigation';
import {Content} from 'ssb-typescript';
import {SSBSource} from '../../../drivers/ssb';
import {Response as DRes, Request as DReq} from '../../../drivers/dialogs';
import intent from './intent';
import view from './view';
import navigation from './navigation';
import model, {State, Actions} from './model';
import ssb from './ssb';
import dialogs from './dialogs';

export {navigatorStyle} from './view';
export {State} from './model';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  onion: StateSource<State>;
  ssb: SSBSource;
  dialog: Stream<DRes>;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content>;
  dialog: Stream<DReq>;
};

export default function editProfile(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);
  const command$ = navigation(sources.dialog, actions);
  const reducer$ = model(actions);
  const content$ = ssb(sources.onion.state$, actions);
  const dialog$ = dialogs(sources.navigation);

  return {
    screen: vdom$,
    navigation: command$,
    onion: reducer$,
    ssb: content$,
    dialog: dialog$,
  };
}
