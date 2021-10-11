// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
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
  const actions = intent(
    sources.screen,
    sources.navigation,
    sources.dialog,
    state$,
  );
  const vdom$ = view(state$, manageAliasesSinks.screen);
  const command$ = xs.merge(navigation(actions), manageAliasesSinks.navigation);
  const reducer$ = xs.merge(
    model(sources.props, actions),
    manageAliasesSinks.state as Stream<Reducer<State>>,
  );
  const req$ = ssb(state$, actions);
  const dismiss$ = command$.mapTo('dismiss' as 'dismiss');
  const commandAfterDismissKeyboard$ = command$.compose(delay(16));

  return {
    screen: vdom$,
    navigation: commandAfterDismissKeyboard$,
    state: reducer$,
    toast: manageAliasesSinks.toast,
    keyboard: dismiss$,
    ssb: req$,
  };
}
