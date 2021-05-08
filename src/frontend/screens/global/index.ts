/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import {Reducer, StateSource} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {GlobalEvent} from '../../drivers/eventbus';
import {Req, SSBSource} from '../../drivers/ssb';
import {Command as LocalizationCmd} from '../../drivers/localization';
import {FSSource} from '../../drivers/fs';
import {DialogSource} from '../../drivers/dialogs';
import model, {State} from './model';
import intent from './intent';
import navigation from './navigation';
import ssb from './ssb';
import localization from './localization';

export type Sources = {
  state: StateSource<State>;
  ssb: SSBSource;
  fs: FSSource;
  globalEventBus: Stream<GlobalEvent>;
  linking: Stream<string>;
  asyncstorage: AsyncStorageSource;
  dialog: DialogSource;
};

export type Sinks = {
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
  ssb: Stream<Req>;
  localization: Stream<LocalizationCmd>;
};

export function global(sources: Sources): Sinks {
  const actions = intent(sources.globalEventBus, sources.linking);
  const cmd$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb, sources.asyncstorage);
  const updateLocalization$ = localization(sources.fs);
  const req$ = ssb(updateLocalization$, actions, sources.dialog);

  return {
    navigation: cmd$,
    state: reducer$,
    localization: updateLocalization$,
    ssb: req$,
  };
}
