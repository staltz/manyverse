// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {TypedCommand as StorageCommand} from '~frontend/drivers/asyncstorage';
import view from './view';
import model, {State} from './model';
import intent from './intent';
import asyncStorage from './asyncstorage';

export interface Sources {
  screen: ReactSource;
  state: StateSource<State>;
  asyncstorage: AsyncStorageSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  menuPress: Stream<any>;
  state: Stream<Reducer<State>>;
  publicSearch: Stream<any>;
  feedSettings: Stream<any>;
  asyncstorage: Stream<StorageCommand>;
  scrollToPublicTop$: Stream<null>;
}

export function topBar(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(sources.screen, state$);
  const reducer$ = model(actions, sources.asyncstorage);
  const vdom$ = view(state$);
  const storageCommand$ = asyncStorage(actions);

  return {
    screen: vdom$,
    state: reducer$,
    menuPress: actions.menu$,
    publicSearch: actions.publicSearch$,
    feedSettings: actions.feedSettings$,
    asyncstorage: storageCommand$,
    scrollToPublicTop$: actions.scrollToPublicTop$,
  };
}
