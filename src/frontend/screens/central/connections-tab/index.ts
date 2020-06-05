/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
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
import {State as AppState} from '../../../drivers/appstate';
import {NetworkSource} from '../../../drivers/network';
import {SSBSource, Req} from '../../../drivers/ssb';
import {DialogSource} from '../../../drivers/dialogs';
import {Toast, Duration as ToastDuration} from '../../../drivers/toast';
import {t} from '../../../drivers/localization';
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
  appstate: Stream<AppState>;
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
  toast: Stream<Toast>;
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
    actionsPlus,
    sources.asyncstorage,
    sources.ssb,
    sources.network,
    sources.appstate,
  );
  const fabProps$ = floatingAction(sources.state.stream);
  const ssb$ = ssb(actionsPlus);
  const alert$ = alert(actionsPlus, sources.state.stream);
  const vdom$ = view(sources.state.stream);

  const share$ = xs.merge(
    actionsPlus.shareDhtInvite$.map(inviteCode => ({
      title: t('connections.share_code.p2p.title'),
      message: t('connections.share_code.p2p.message') + '\n\n' + inviteCode,
      dialogTitle: t('connections.share_code.p2p.dialog_note'),
    })),
    actionsPlus.shareRoomInvite$.map(({invite, room}) => ({
      title: t('connections.share_code.room.title'),
      message:
        t('connections.share_code.room.message', {name: room}) +
        '\n\n' +
        invite,
      dialogTitle: t('connections.share_code.room.dialog_note'),
    })),
  );

  const inviteToast$: Stream<Toast> = sources.ssb.acceptInviteResponse$.map(
    res => {
      if (res === true)
        return {
          type: 'show' as 'show',
          flavor: 'success',
          message: t('connections.toasts.invite_accepted'),
          duration: ToastDuration.SHORT,
        } as Toast;
      else
        return {
          type: 'show' as 'show',
          flavor: 'failure',
          message: t('connections.toasts.invite_rejected'),
          duration: ToastDuration.LONG,
        } as Toast;
    },
  );

  return {
    alert: alert$,
    navigation: command$,
    asyncstorage: storageCommand$,
    screen: vdom$,
    state: reducer$,
    fab: fabProps$,
    ssb: ssb$,
    share: share$,
    toast: inviteToast$,
    exit: actionsPlus.goBack$,
  };
}
