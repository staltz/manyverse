/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Reducer, StateSource} from '@cycle/state';
import {
  Command as StorageCommand,
  AsyncStorageSource,
} from 'cycle-native-asyncstorage';
import {GlobalEvent} from '../../drivers/eventbus';
import {SSBSource} from '../../drivers/ssb';
import {Command as LocalizationCmd} from '../../drivers/localization';
import {FSSource} from '../../drivers/fs';
import model, {State} from './model';
import intent from './intent';
import navigation from './navigation';
import localization from './localization';
import asyncStorage from './asyncstorage';

export type Sources = {
  state: StateSource<State>;
  ssb: SSBSource;
  fs: FSSource;
  globalEventBus: Stream<GlobalEvent>;
  asyncstorage: AsyncStorageSource;
};

export type Sinks = {
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
  localization: Stream<LocalizationCmd>;
  asyncstorage: Stream<StorageCommand>;
  globalEventBus: Stream<GlobalEvent>;
};

export function global(sources: Sources): Sinks {
  const actions = intent(sources.globalEventBus);
  const cmd$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb, sources.asyncstorage);
  const updateLocalization$ = localization(sources.fs);
  const storageCommand$ = asyncStorage();

  const lastSessionTimestamp$ = sources.state.stream
    .map((state) => state.lastSessionTimestamp)
    .filter((lastSessionTimestamp) => !!lastSessionTimestamp) as Stream<number>;

  const globalEvents$ = actions.requestLastSessionTimestamp$
    .compose(sample(lastSessionTimestamp$))
    .map(
      (lastSessionTimestamp) =>
        ({
          type: 'responseLastSessionTimestamp',
          lastSessionTimestamp,
        } as GlobalEvent),
    );

  return {
    navigation: cmd$,
    state: reducer$,
    localization: updateLocalization$,
    asyncstorage: storageCommand$,
    globalEventBus: globalEvents$,
  };
}
