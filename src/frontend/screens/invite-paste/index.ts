/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {Command as AlertCommand} from 'cycle-native-alert';
import {SSBSource, Req as SSBReq} from '../../drivers/ssb';
import {LifecycleEvent} from '../../drivers/lifecycle';
import {t} from '../../drivers/localization';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  lifecycle: Stream<LifecycleEvent>;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  alert: Stream<AlertCommand>;
  ssb: Stream<SSBReq>;
};

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
  animations: {
    push: {
      enabled: false,
    },
    pop: {
      enabled: false,
    },
  },
};

export function pasteInvite(sources: Sources): Sinks {
  const actions = intent(
    sources.screen,
    sources.navigation,
    sources.state.stream,
    sources.keyboard,
    sources.lifecycle,
  );
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions);
  const reducer$ = model(actions);
  const newContent$ = ssb(actions);
  const dismiss$ = xs
    .merge(actions.done$, actions.back$)
    .mapTo('dismiss' as 'dismiss');

  const alert$ = actions.dhtDone$.map(
    () =>
      ({
        title: t('invite_paste.alert_unsupported_dht.title'),
        message: t('invite_paste.alert_unsupported_dht.description'),
        buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
      } as AlertCommand),
  );

  return {
    keyboard: dismiss$,
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    alert: alert$,
    ssb: newContent$,
  };
}
