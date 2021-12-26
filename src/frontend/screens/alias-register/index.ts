// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {view} from './view';
import {Command, NavSource} from 'cycle-native-navigation';
import {DialogSource} from '../../drivers/dialogs';
import {model, State} from './model';
export {navOptions} from './layout';
import {Props} from './props';
import {intent} from './intent';

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
