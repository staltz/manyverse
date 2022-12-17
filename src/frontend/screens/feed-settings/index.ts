// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {ReactElement} from 'react';
import {Platform} from 'react-native';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {Req, SSBSource} from '~frontend/drivers/ssb';
import {TypedCommand as StorageCommand} from '~frontend/drivers/asyncstorage';

import intent from './intent';
import model, {State} from './model';
import navigation from './navigation';
import {Props} from './props';
import view from './view';
import ssb from './ssb';
import asyncStorage from './asyncstorage';

export interface Sources {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
  state: StateSource<State>;
  asyncstorage: AsyncStorageSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  ssb: Stream<Req>;
  state: Stream<Reducer<State>>;
  asyncstorage: Stream<StorageCommand>;
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

export function feedSettings(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(sources.screen, sources.navigation);

  const reducer$ = model(
    sources.props,
    actions,
    sources.asyncstorage,
    sources.ssb,
  );

  const vdom$ = view(state$);
  const command$ = navigation(actions, state$);
  const req$ = ssb(actions);
  const storageCommand$ = asyncStorage(actions);

  return {
    screen: vdom$,
    state: reducer$,
    navigation: command$,
    ssb: req$,
    asyncstorage: storageCommand$,
  };
}
