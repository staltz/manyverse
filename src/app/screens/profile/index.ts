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
import isolate from '@cycle/isolate';
import {ScreenVNode, Command, ScreensSource} from 'cycle-native-navigation';
import {Content} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {
  Response as DialogRes,
  Request as DialogReq,
} from '../../drivers/dialogs';
import {Screens} from '../..';
import editProfile from './edit';
import intent from './intent';
import model, {State, editLens} from './model';
import view from './view';
import ssb from './ssb';
import {navigatorStyle} from './styles';
import navigation from './navigation';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  onion: StateSource<State>;
  ssb: SSBSource;
  dialog: Stream<DialogRes>;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content>;
  dialog: Stream<DialogReq>;
};

export const navOptions = () => ({
  screen: Screens.Profile,
  navigatorStyle,
});

export function profile(sources: Sources): Sinks {
  const editSinks: Sinks = isolate(editProfile, {'*': 'edit', onion: editLens})(
    sources,
  );

  const actions = intent(sources.screen);
  const reducer$ = model(sources.onion.state$, actions, sources.ssb);
  const vdom$ = view(sources.onion.state$, sources.ssb);
  const newContent$ = ssb(actions, sources.onion.state$);
  const command$ = navigation(actions);

  return {
    screen: xs.merge(vdom$, editSinks.screen),
    navigation: xs.merge(command$, editSinks.navigation),
    onion: xs.merge(reducer$, editSinks.onion),
    ssb: xs.merge(newContent$, editSinks.ssb),
    dialog: editSinks.dialog,
  };
}
