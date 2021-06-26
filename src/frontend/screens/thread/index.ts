/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {StateSource, Reducer} from '@cycle/state';
import {KeyboardSource} from 'cycle-native-keyboard';
import {
  AsyncStorageSource,
  Command as StorageCommand,
} from 'cycle-native-asyncstorage';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast} from '../../drivers/toast';
import messageEtc from '../../components/messageEtc';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import navigation from './navigation';
import asyncStorage from './asyncstorage';
export {navOptions} from './layout';
import {Props as P} from './props';

export type Props = P;

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  asyncstorage: AsyncStorageSource;
  props: Stream<Props>;
  keyboard: KeyboardSource;
  dialog: DialogSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  asyncstorage: Stream<StorageCommand>;
  keyboard: Stream<'dismiss'>;
  state: Stream<Reducer<State>>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  ssb: Stream<Req>;
};

export function thread(sources: Sources): Sinks {
  const actions = intent(
    sources.props,
    sources.screen,
    sources.keyboard,
    sources.navigation,
    sources.ssb,
    sources.state.stream,
  );
  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });
  const actionsPlus = {...actions, goToRawMsg$: messageEtcSinks.goToRawMsg$};
  const reducer$ = model(
    sources.props,
    actionsPlus,
    sources.asyncstorage,
    sources.ssb,
  );
  const storageCommand$ = asyncStorage(actionsPlus, sources.state.stream);
  const command$ = navigation(actionsPlus, sources.state.stream);
  const vdom$ = view(sources.state.stream, actionsPlus);
  const newContent$ = ssb(actionsPlus);
  const dismiss$ = actions.publishMsg$.mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    navigation: command$,
    keyboard: dismiss$,
    state: reducer$,
    asyncstorage: storageCommand$,
    clipboard: messageEtcSinks.clipboard,
    toast: messageEtcSinks.toast,
    ssb: newContent$,
  };
}
