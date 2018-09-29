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
import {Command, NavSource} from 'cycle-native-navigation';
import {About, FeedId} from 'ssb-typescript';
import {SSBSource, Req} from '../../drivers/ssb';
import {Response as DRes, Request as DReq} from '../../drivers/dialogs';
import {Toast, Duration as ToastDuration} from '../../drivers/toast';
import isolate from '@cycle/isolate';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import view from './view';
import navigation from './navigation';
import model, {State} from './model';
import ssb from './ssb';
import dialogs from './dialogs';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
export {State} from './model';

export type Props = {
  about: About & {id: FeedId};
};

export type Sources = {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  onion: StateSource<State>;
  ssb: SSBSource;
  dialog: Stream<DRes>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  ssb: Stream<Req>;
  dialog: Stream<DReq>;
  toast: Stream<Toast>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export function editProfile(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const actions = intent(sources.screen, sources.dialog);
  const vdom$ = view(sources.onion.state$, topBarSinks.screen);
  const command$ = navigation(actions);
  const reducer$ = model(sources.props, actions);
  const content$ = ssb(sources.onion.state$, actions);
  const dialog$ = dialogs(sources.navigation, topBarSinks.back);
  const dismiss$ = actions.save$.mapTo('dismiss' as 'dismiss');
  const toast$: Stream<Toast> = actions.changeAvatar$.map(() => {
    return {
      type: 'show' as 'show',
      message: 'No support for uploading profile pictures, yet',
      duration: ToastDuration.SHORT,
    };
  });

  return {
    screen: vdom$,
    navigation: command$,
    onion: reducer$,
    keyboard: dismiss$,
    ssb: content$,
    dialog: dialog$,
    toast: toast$,
  };
}
