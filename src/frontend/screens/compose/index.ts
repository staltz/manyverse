// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import isolate from '@cycle/isolate';
import {ReactElement} from 'react';
import {Platform} from 'react-native';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {
  Command as StorageCommand,
  AsyncStorageSource,
} from 'cycle-native-asyncstorage';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {GlobalEvent} from '../../drivers/eventbus';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import model, {State, topBarLens} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
import dialog from './dialog';
import asyncStorage from './asyncstorage';
import {Props as P} from './props';

export type Props = P;

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  props: Stream<Props>;
  asyncstorage: AsyncStorageSource;
  globalEventBus: Stream<GlobalEvent>;
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
  sideMenu: {
    left: {
      enabled: Platform.OS === 'web',
    },
  },
  animations: {
    push: {
      enabled: false,
    },
    pop: {
      enabled: false,
    },
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
    sources.globalEventBus,
    topBarSinks.back,
    topBarSinks.done,
    sources.state.stream,
  );
  const dialogActions = dialog(actions, sources.dialog);
  const actionsPlus = {...actions, ...dialogActions};
  const dismissKeyboard$ = xs
    .merge(actionsPlus.exit$, actionsPlus.goToComposeAudio$)
    .mapTo('dismiss' as 'dismiss');
  const vdom$ = view(sources.state.stream, topBarSinks.screen);
  const command$ = navigation(actionsPlus);
  const reducer$ = model(
    sources.props,
    actionsPlus,
    sources.state.stream,
    sources.asyncstorage,
    sources.ssb,
  );
  const storageCommand$ = asyncStorage(actionsPlus, sources.state.stream);
  const newContent$ = ssb(actionsPlus);

  return {
    keyboard: dismissKeyboard$,
    screen: vdom$,
    navigation: command$,
    asyncstorage: storageCommand$,
    state: reducer$,
    ssb: newContent$,
  };
}
