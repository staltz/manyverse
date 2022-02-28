// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {Command as StorageCommand} from 'cycle-native-asyncstorage';
import {Req, SSBSource} from '~frontend/drivers/ssb';
import {NetworkSource} from '~frontend/drivers/network';
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import model, {State} from './model';
import ssb from './ssb';
import intent from './intent';
import view from './view';
import navigation from './navigation';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  network: NetworkSource;
  state: StateSource<State>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  dialog: Stream<AlertCommand>;
  state: Stream<Reducer<State>>;
  asyncstorage: Stream<StorageCommand>;
  ssb: Stream<Req>;
}

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};

export function resync(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(state$, sources.screen);

  const reducer$ = model(sources.network, sources.ssb);

  const navCommand$ = navigation(actions);

  const alert$ = actions.connectViaWifi$.mapTo({
    type: 'alert' as const,
    title: t('resync.instructions.connect_via_wifi.title'),
    content: t('resync.instructions.connect_via_wifi.description'),
    options: {
      ...Palette.dialogColors,
      positiveColor: Palette.textDialogStrong,
      positiveText: t('call_to_action.ok'),
    },
  });

  const vdom$ = view(state$);

  const req$ = ssb(actions, state$);

  const storageCommand$ = xs.merge(
    xs.of({
      type: 'setItem',
      key: 'resyncing',
      value: `${Date.now()}`,
    } as StorageCommand),

    actions.willGoToCentral$.mapTo({
      type: 'removeItem',
      key: 'resyncing',
    } as StorageCommand),
  );

  return {
    screen: vdom$,
    dialog: alert$,
    navigation: navCommand$,
    state: reducer$,
    asyncstorage: storageCommand$,
    ssb: req$,
  };
}
