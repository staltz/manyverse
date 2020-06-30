/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {Toast, Duration} from '../../drivers/toast';
import {t} from '../../drivers/localization';
import {MAX_PRIVATE_MESSAGE_RECIPIENTS} from '../../ssb/utils/constants';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import navigation from './navigation';
import {Props as P} from './props';

export type Props = P;

export type Sources = {
  screen: ReactSource;
  props: Stream<Props>;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  toast: Stream<Toast>;
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

export function recipientsInput(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const vdom$ = view(state$);
  const actions = intent(sources.screen, sources.navigation, state$);
  const reducer$ = model(sources.props, state$, sources.ssb, actions);
  const command$ = navigation(actions, state$);
  const toast$ = actions.maxReached$.mapTo({
    type: 'show',
    message: t('recipients_input.toasts.limit_reached', {
      limit: MAX_PRIVATE_MESSAGE_RECIPIENTS,
    }),
    duration: Duration.LONG,
  } as Toast);

  return {
    screen: vdom$,
    navigation: command$,
    toast: toast$,
    state: reducer$,
  };
}
