// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {StateSource, Reducer} from '@cycle/state';
import {KeyboardSource} from 'cycle-native-keyboard';
import {
  AsyncStorageSource,
  Command as StorageCommand,
} from 'cycle-native-asyncstorage';
import {SSBSource, Req} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Toast} from '~frontend/drivers/toast';
import messageEtc from '~frontend/components/messageEtc';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import navigation from './navigation';
import asyncStorage from './asyncstorage';
export {navOptions} from './layout';
import {Props as P} from './props';

export type Props = P;

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  asyncstorage: AsyncStorageSource;
  props: Stream<Props>;
  keyboard: KeyboardSource;
  dialog: DialogSource;
  state: StateSource<State>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  asyncstorage: Stream<StorageCommand>;
  keyboard: Stream<'dismiss'>;
  state: Stream<Reducer<State>>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  ssb: Stream<Req>;
}

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
    sources.state.stream,
  );
  const storageCommand$ = asyncStorage(actionsPlus, sources.state.stream);
  const command$ = navigation(actionsPlus, sources.state.stream);
  const vdom$ = view(sources.state.stream, actionsPlus);
  const newContent$ = ssb(actionsPlus);
  const dismiss$ = xs
    .merge(actions.exit$, actions.publishMsg$)
    .mapTo('dismiss' as 'dismiss');

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
