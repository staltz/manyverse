// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {Reducer, StateSource} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {GlobalEvent} from '~frontend/drivers/eventbus';
import {Req, SSBSource} from '~frontend/drivers/ssb';
import {Command as LocalizationCmd} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {FSSource} from '~frontend/drivers/fs';
import {Toast} from '~frontend/drivers/toast';
import model, {State} from './model';
import intent from './intent';
import navigation from './navigation';
import ssb from './ssb';
import localization from './localization';
import toast from './toast';

export interface Sources {
  state: StateSource<State>;
  ssb: SSBSource;
  fs: FSSource;
  navigation: NavSource;
  globalEventBus: Stream<GlobalEvent>;
  linking: Stream<string>;
  asyncstorage: AsyncStorageSource;
  dialog: DialogSource;
}

export interface Sinks {
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
  ssb: Stream<Req>;
  localization: Stream<LocalizationCmd>;
  toast: Stream<Toast>;
  globalEventBus: Stream<GlobalEvent>;
}

export function global(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(
    sources.globalEventBus,
    sources.navigation,
    sources.linking,
    sources.dialog,
    sources.ssb,
    state$,
  );
  const cmd$ = navigation(actions, state$);
  const reducer$ = model(sources.ssb, sources.asyncstorage);
  const updateLocalization$ = localization(sources.fs);
  const req$ = ssb(updateLocalization$, actions);
  const toast$ = toast(actions, sources.ssb);

  const event$ = actions.approvedCheckingNewVersion$
    .take(1)
    .mapTo({type: 'approveCheckingNewVersion'} as GlobalEvent);

  return {
    navigation: cmd$,
    state: reducer$,
    localization: updateLocalization$,
    ssb: req$,
    toast: toast$,
    globalEventBus: event$,
  };
}
