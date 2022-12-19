// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Platform} from 'react-native';
import {Reducer, StateSource} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {Req, SSBSource} from '~frontend/drivers/ssb';
import {Toast} from '~frontend/drivers/toast';
import {Command as AlertCommand, DialogSource} from '~frontend/drivers/dialogs';
import messageEtc from '~frontend/components/messageEtc';
import messageShare from '~frontend/components/messageShare';
import timestampAlert from '~frontend/components/timestamp-alert';
import intent from './intent';
import view from './view';
import model, {State} from './model';
import ssb from './ssb';
import navigation from './navigation';
import {Props as P} from './props';

export type Props = P;

export interface Sources {
  screen: ReactSource;
  props: Stream<Props>;
  navigation: NavSource;
  ssb: SSBSource;
  state: StateSource<State>;
  dialog: DialogSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  keyboard: Stream<'dismiss'>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  dialog: Stream<AlertCommand>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
}

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: Platform.OS === 'web',
    },
  },
};

export function search(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(sources.navigation, sources.screen);

  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });

  const messageShareSinks = messageShare({
    appear$: actions.openMessageShare$,
    dialog: sources.dialog,
  });

  const actionsPlus = {
    ...actions,
    goToRawMsg$: messageEtcSinks.goToRawMsg$,
  };

  const reducer$ = model(sources.props, state$, sources.ssb, actions);
  const vdom$ = view(state$);
  const command$ = navigation(actionsPlus, state$);
  const dismissKeyboard$ = xs
    .merge(actions.goBack$, actions.goToThread$)
    .mapTo('dismiss' as const);

  const newContent$ = ssb(actionsPlus, state$);

  const alert$ = actions.viewTimestamp$.map(timestampAlert);

  return {
    screen: vdom$,
    keyboard: dismissKeyboard$,
    navigation: command$,
    dialog: alert$,
    state: reducer$,
    ssb: newContent$,
    clipboard: messageShareSinks.clipboard,
    toast: messageShareSinks.toast,
  };
}
