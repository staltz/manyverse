/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from '@cycle/state';
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {SSBSource, Req} from '../../../drivers/ssb';
import {DialogSource} from '../../../drivers/dialogs';
import {Toast} from '../../../drivers/toast';
import messageEtc from '../../../components/messageEtc';
import intent from './intent';
import view from './view';
import model, {State} from './model';
import ssb from './ssb';
import floatingAction from './fab';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
  scrollToTop: Stream<any>;
  dialog: DialogSource;
  fab: Stream<string>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  fab: Stream<FabProps>;
};

export function publicTab(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.fab);
  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });
  const actionsPlus = {...actions, goToRawMsg$: messageEtcSinks.goToRawMsg$};
  const vdom$ = view(sources.state.stream, sources.ssb, sources.scrollToTop);
  const command$ = navigation(actionsPlus, sources.state.stream);
  const reducer$ = model(sources.state.stream, actionsPlus, sources.ssb);
  const fabProps$ = floatingAction(sources.state.stream);
  const newContent$ = ssb(actionsPlus);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    ssb: newContent$,
    clipboard: messageEtcSinks.clipboard,
    toast: messageEtcSinks.toast,
    fab: fabProps$,
  };
}
