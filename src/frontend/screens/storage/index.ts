// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {Platform} from 'react-native';
import {Reducer, StateSource} from '@cycle/state';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Req, SSBSource} from '~frontend/drivers/ssb';

import intent from './intent';
import model, {State} from './model';
import navigation from './navigation';
import {Props} from './props';
import view from './view';
import ssb from './ssb';
import manageContact$ from './manage-contact';

export interface Sources {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
  dialog: DialogSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  ssb: Stream<Req>;
  state: Stream<Reducer<State>>;
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

export function storage(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const actions = intent(
    sources.screen,
    sources.navigation,
    sources.dialog,
    state$,
  );

  const manageContactActions = manageContact$({
    dialog: sources.dialog,
    ssb: sources.ssb,
    manageContact$: actions.manageAccount$,
  });

  const actionsPlus = {
    ...actions,
    ...manageContactActions,
  };

  const reducer$ = model(sources.props, sources.ssb);
  const vdom$ = view(state$, sources.ssb);
  const command$ = navigation(actionsPlus, sources.navigation, state$);
  const req$ = ssb(actionsPlus, state$);

  return {
    screen: vdom$,
    state: reducer$,
    navigation: command$,
    ssb: req$,
  };
}
