// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from '@cycle/state';
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {
  Command as StorageCommand,
  AsyncStorageSource,
} from 'cycle-native-asyncstorage';
import {SSBSource, Req} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Toast} from '~frontend/drivers/toast';
import messageEtc from '~frontend/components/messageEtc';
import intent from './intent';
import view from './view';
import model, {State} from './model';
import ssb from './ssb';
import floatingAction from './fab';
import asyncStorage from './asyncstorage';
import navigation from './navigation';
import {FabProps} from '../fab';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  asyncstorage: AsyncStorageSource;
  state: StateSource<State>;
  ssb: SSBSource;
  scrollToTop: Stream<any>;
  dialog: DialogSource;
  fab: Stream<string>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  asyncstorage: Stream<StorageCommand>;
  ssb: Stream<Req>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  fab: Stream<FabProps>;
}

export function publicTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.navigation, sources.fab);
  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });
  const actionsPlus = {...actions, goToRawMsg$: messageEtcSinks.goToRawMsg$};
  const vdom$ = view(sources.state.stream, sources.ssb, sources.scrollToTop);
  const command$ = navigation(actionsPlus, sources.state.stream);
  const reducer$ = model(actionsPlus, sources.asyncstorage, sources.ssb);
  const fabProps$ = floatingAction(sources.state.stream);
  const newContent$ = ssb(actionsPlus);
  const storageCommand$ = asyncStorage(actionsPlus, sources.asyncstorage);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    ssb: newContent$,
    asyncstorage: storageCommand$,
    clipboard: messageEtcSinks.clipboard,
    toast: messageEtcSinks.toast,
    fab: fabProps$,
  };
}
