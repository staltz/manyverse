/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {StateSource, Reducer} from '@cycle/state';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast, Duration as ToastDuration} from '../../drivers/toast';
import {t} from '../../drivers/localization';
import intent from './intent';
import view from './view';
import navigation from './navigation';
import model, {State} from './model';
import ssb from './ssb';
import {Props} from './props';
export {Props} from './props';
export {State} from './model';

export interface Sources {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  state: StateSource<State>;
  ssb: SSBSource;
  dialog: DialogSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  ssb: Stream<Req>;
  toast: Stream<Toast>;
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

export function editProfile(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(sources.screen, sources.navigation, sources.dialog);
  const vdom$ = view(state$);
  const command$ = navigation(actions, state$);
  const reducer$ = model(sources.props, actions, sources.ssb);
  const req$ = ssb(state$, actions);
  const dismiss$ = actions.save$.mapTo('dismiss' as 'dismiss');

  const successfullyRemovedAlias$ = actions.removeAlias$
    .map(({room, alias}) => sources.ssb.revokeAlias$(room, alias))
    .flatten()
    .map(
      () =>
        ({
          type: 'show' as const,
          flavor: 'success',
          message: t('profile_edit.toasts.alias_removed_success'),
          duration: ToastDuration.SHORT,
        } as Toast),
    );

  const revokeAliasResponse$ = successfullyRemovedAlias$.replaceError(() =>
    successfullyRemovedAlias$.startWith({
      type: 'show' as const,
      flavor: 'failure',
      message: t('profile_edit.toasts.alias_removed_failure'),
      duration: ToastDuration.SHORT,
    } as Toast),
  );

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    toast: revokeAliasResponse$,
    keyboard: dismiss$,
    ssb: req$,
  };
}
