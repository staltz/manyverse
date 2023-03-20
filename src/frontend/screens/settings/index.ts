// SPDX-FileCopyrightText: 2020-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {Platform} from 'react-native';
import {Reducer, StateSource} from '@cycle/state';
import {Command as AlertCommand, DialogSource} from '~frontend/drivers/dialogs';
import {SSBSource, Req} from '~frontend/drivers/ssb';
import {TypedCommand as StorageCommand} from '~frontend/drivers/asyncstorage';
import {GlobalEvent} from '~frontend/drivers/eventbus';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import alert from './alert';
import navigation from './navigation';
import linking from './linking';
import {Props} from './props';
import asyncStorage from './asyncstorage';

export interface Sources {
  props: Stream<Props>;
  dialog: DialogSource;
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
  state: StateSource<State>;
  asyncstorage: AsyncStorageSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  asyncstorage: Stream<StorageCommand>;
  linking: Stream<string>;
  dialog: Stream<AlertCommand>;
  globalEventBus: Stream<GlobalEvent>;
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

export function settings(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(sources.screen, sources.navigation, sources.dialog);
  const reducer$ = model(
    sources.props,
    actions,
    sources.ssb,
    sources.asyncstorage,
  );
  const vdom$ = view(state$);
  const req$ = ssb(actions, sources.ssb);
  const alert$ = alert(actions);
  const command$ = navigation(actions, sources.navigation, state$);
  const links$ = linking(actions);
  const storageCmd$ = asyncStorage(actions);

  const event$ = actions.toggleAllowCheckingNewVersion$
    .compose(dropRepeats())
    .map<GlobalEvent>((enabled) => ({type: 'checkingNewVersion', enabled}));

  return {
    screen: vdom$,
    state: reducer$,
    navigation: command$,
    ssb: req$,
    linking: links$,
    asyncstorage: storageCmd$,
    globalEventBus: event$,
    dialog: alert$,
  };
}
