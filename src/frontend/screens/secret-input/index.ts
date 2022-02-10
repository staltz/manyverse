// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {SSBSource} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import navigation from './navigation';
import view from './view';
import model, {State} from './model';
import dialog from './dialog';

export type Props = {
  practiceMode?: boolean;
  backendWords?: string;
};

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  props: Stream<Props>;
  state: StateSource<State>;
  dialog: DialogSource;
  ssb: SSBSource;
};

export type Sinks = {
  keyboard: Stream<'dismiss'>;
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
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
};

function intent(navSource: NavSource, screenSource: ReactSource) {
  return {
    goBack$: xs.merge(
      navSource.backPress(),
      screenSource.select('topbar').events('pressBack'),
    ),

    updateWords$: screenSource
      .select('inputField')
      .events<string>('changeText'),

    confirm$: screenSource.select('confirm').events('press'),
  };
}

export function secretInput(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(sources.navigation, sources.screen);
  const confirmation$ = dialog(actions, state$, sources.ssb, sources.dialog);
  const dismissKeyboard$ = actions.goBack$.mapTo('dismiss' as 'dismiss');
  const vdom$ = view(state$);
  const command$ = navigation(state$, actions, confirmation$);
  const reducer$ = model(sources.props, actions);

  return {
    keyboard: dismissKeyboard$,
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
