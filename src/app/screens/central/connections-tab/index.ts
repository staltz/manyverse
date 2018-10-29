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
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  network: NetworkSource;
  ssb: SSBSource;
  fab: Stream<string>;
  dialog: DialogSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
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
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(
    sources.state.stream,
    actions,
    sources.ssb,
    sources.network,
  );
  const fabProps$ = floatingAction(sources.state.stream);
  const ssb$ = ssb(actions);
  const alert$ = alert(actions, sources.state.stream);
  const share$ = actions.shareDhtInvite$.map(inviteCode => ({
    message:
      'Connect with me on Manyverse by pasting this invite code there:\n\n' +
      inviteCode,
    title: 'Manyverse Invite Code',
    dialogTitle: 'Give this invite code to one friend',
  }));

  return {
    alert: alert$,
    navigation: command$,
    screen: vdom$,
    state: reducer$,
    fab: fabProps$,
    ssb: ssb$,
    share: share$,
    exit: actions.goBack$,
  };
}
