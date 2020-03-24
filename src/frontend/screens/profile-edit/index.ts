/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {About, FeedId} from 'ssb-typescript';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
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
  state: StateSource<State>;
  ssb: SSBSource;
  dialog: DialogSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  ssb: Stream<Req>;
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
};

export function editProfile(sources: Sources): Sinks {
  const dialogRes$ = dialogs(
    sources.navigation,
    sources.screen,
    sources.dialog,
  );
  const actions = intent(sources.screen, dialogRes$);
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions);
  const reducer$ = model(sources.props, actions);
  const content$ = ssb(sources.state.stream, actions);
  const dismiss$ = actions.save$.mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    keyboard: dismiss$,
    ssb: content$,
  };
}
