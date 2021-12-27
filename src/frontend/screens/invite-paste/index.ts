// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {Platform} from 'react-native';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {Command as AlertCommand, DialogSource} from '../../drivers/dialogs';
import {SSBSource, Req as SSBReq} from '../../drivers/ssb';
import {LifecycleEvent} from '../../drivers/lifecycle';
import {t} from '../../drivers/localization';
import {readOnlyDisclaimer} from '../../components/read-only-disclaimer';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  dialog: DialogSource;
  lifecycle: Stream<LifecycleEvent>;
  state: StateSource<State>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  dialog: Stream<AlertCommand>;
  ssb: Stream<SSBReq>;
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
  const req$ = ssb(actions)
    .map((req) => {
      if (
        req.type === 'invite.accept' &&
        Platform.OS === 'web' &&
        process.env.SSB_DB2_READ_ONLY
      ) {
        return readOnlyDisclaimer(sources.dialog);
      } else {
        return xs.of(req);
      }
    })
    .flatten();

  const dismiss$ = xs
    .merge(actions.done$, actions.back$)
    .mapTo('dismiss' as 'dismiss');

  const alert$ = actions.dhtDone$.map(() => ({
    type: 'alert' as const,
    title: t('invite_paste.alert_unsupported_dht.title'),
    content: t('invite_paste.alert_unsupported_dht.description'),
    options: {positiveText: t('call_to_action.ok')},
  }));

  return {
    keyboard: dismiss$,
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    dialog: alert$,
    ssb: req$,
  };
}
