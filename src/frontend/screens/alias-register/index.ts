// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import {intent} from './intent';
import {model, State} from './model';
import {view} from './view';
export {navOptions} from './layout';
import {Props} from './props';

export interface Sources {
  props: Stream<Props>;
  navigation: NavSource;
  screen: ReactSource;
  ssb: SSBSource;
  state: StateSource<State>;
  dialog: DialogSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
}

export function registerAlias(sources: Sources): Sinks {
  const vdom$ = view(sources.state.stream);
  const actions = intent(sources.navigation, sources.screen, sources.dialog);
  const goBack$ = actions.back$.map(() => ({type: 'pop'} as Command));
  const reducer$ = model(sources.props, actions, sources.ssb);

  return {
    screen: vdom$,
    state: reducer$,
    navigation: goBack$,
  };
}
