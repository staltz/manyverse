/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from '@cycle/state';
import {Command as AlertCommand} from 'cycle-native-alert';
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {SharedContent} from 'cycle-native-share';
import {
  Command as StorageCommand,
  AsyncStorageSource,
} from 'cycle-native-asyncstorage';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {NetworkSource} from '../../../drivers/network';
import {SSBSource, Req} from '../../../drivers/ssb';
import {DialogSource} from '../../../drivers/dialogs';
import view from './view';
import intent from './intent';
import model, {State} from './model';
import floatingAction from './fab';
import alert from './alert';
import ssb from './ssb';
import asyncStorage from './asyncstorage';
import dialog from './dialog';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  asyncstorage: AsyncStorageSource;
  state: StateSource<State>;
  network: NetworkSource;
  ssb: SSBSource;
  fab: Stream<string>;
  dialog: DialogSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  asyncstorage: Stream<StorageCommand>;
  alert: Stream<AlertCommand>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  fab: Stream<FabProps>;
  share: Stream<SharedContent>;
  exit: Stream<any>;
};

export function connectionsTab(sources: Sources): Sinks {
  const actions = intent(
    sources.screen,
    sources.navigation,
    sources.state.stream,
    sources.fab,
  );
  const dialogActions = dialog(actions, sources.dialog);
  const actionsPlus = {...actions, ...dialogActions};
  const command$ = navigation(actionsPlus, sources.state.stream);
  const storageCommand$ = asyncStorage(sources.state.stream);
  const reducer$ = model(
    sources.state.stream,
    actionsPlus,
    sources.asyncstorage,
    sources.ssb,
    sources.network,
  );
  const fabProps$ = floatingAction(sources.state.stream);
  const ssb$ = ssb(actionsPlus);
  const alert$ = alert(actionsPlus, sources.state.stream);
  const share$ = actionsPlus.shareDhtInvite$.map(inviteCode => ({
    message:
      'Connect with me on Manyverse by pasting this invite code there:\n\n' +
      inviteCode,
    title: 'Manyverse Invite Code',
    dialogTitle: 'Give this invite code to one friend',
  }));
  const vdom$ = view(sources.state.stream);

  return {
    alert: alert$,
    navigation: command$,
    asyncstorage: storageCommand$,
    screen: vdom$,
    state: reducer$,
    fab: fabProps$,
    ssb: ssb$,
    share: share$,
    exit: actionsPlus.goBack$,
  };
}
