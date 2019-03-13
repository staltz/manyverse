/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import isolate from '@cycle/isolate';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {
  Command as StorageCommand,
  AsyncStorageSource,
} from 'cycle-native-asyncstorage';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import model, {State, topBarLens} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
import asyncStorage from './asyncstorage';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  asyncstorage: AsyncStorageSource;
  state: StateSource<State>;
  ssb: SSBSource;
  dialog: DialogSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  asyncstorage: Stream<StorageCommand>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  ssb: Stream<Req>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export function compose(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, {
    '*': 'topBar',
    state: topBarLens,
  })(sources);

  const actions = intent(
    sources.screen,
    sources.navigation,
    topBarSinks.back,
    topBarSinks.previewToggle,
    topBarSinks.done,
    sources.state.stream,
    sources.dialog,
  );
  const dismissKeyboard$ = xs
    .merge(
      actions.publishMsg$,
      actions.exitDeletingDraft$,
      actions.exitSavingDraft$,
      actions.exit$,
    )
    .mapTo('dismiss' as 'dismiss');
  const vdom$ = view(sources.state.stream, topBarSinks.screen);
  const command$ = navigation(actions);
  const reducer$ = model(actions, sources.asyncstorage, sources.ssb);
  const storageCommand$ = asyncStorage(actions, sources.state.stream);
  const newContent$ = ssb(actions);

  return {
    keyboard: dismissKeyboard$,
    screen: vdom$,
    navigation: command$,
    asyncstorage: storageCommand$,
    state: reducer$,
    ssb: newContent$,
  };
}
