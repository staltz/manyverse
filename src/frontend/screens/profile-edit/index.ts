/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {StateSource, Reducer} from '@cycle/state';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast} from '../../drivers/toast';
import manageAliases from '../../components/manage-aliases';
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
  const manageAliasesSinks = manageAliases({
    ...sources,
    props: sources.props.map((p) => ({feedId: p.about.id})),
  });

  const state$ = sources.state.stream;
  const actions = intent(sources.screen, sources.navigation, sources.dialog);
  const vdom$ = view(state$, manageAliasesSinks.screen);
  const command$ = xs.merge(navigation(actions), manageAliasesSinks.navigation);
  const reducer$ = xs.merge(
    model(sources.props, actions),
    manageAliasesSinks.state as Stream<Reducer<State>>,
  );
  const req$ = ssb(state$, actions);
  const dismiss$ = actions.save$.mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    toast: manageAliasesSinks.toast,
    keyboard: dismiss$,
    ssb: req$,
  };
}
