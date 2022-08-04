// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {Req, SSBSource} from '~frontend/drivers/ssb';
import {NetworkSource} from '~frontend/drivers/network';
import model, {State} from './model';
import view from './view';
import {Props} from './props';
import {Toast} from '~frontend/drivers/toast';

export interface Sources {
  screen: ReactSource;
  props: Stream<Props>;
  navigation: NavSource;
  network: NetworkSource;
  state: StateSource<State>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  toast: Stream<Toast>;
}

export function compact(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  // This stream never *emits* anything. Its purpose is to just subscribe to the
  // backPress event, and make sure that backPress causes no action, because
  // the user is not supposed to leave this screen.
  const dummyToast$ = sources.navigation
    .backPress()
    .map(() => xs.never())
    .flatten();

  const reducer$ = model(sources.ssb);

  const vdom$ = view(state$);

  const doneCompacting$ = xs.merge(
    // This is the actual "done" state
    state$.filter((state) => state.done || state.progress === 1).take(1),

    // This is a hack to make sure the screen doesn't get stuck at 100%
    state$
      .filter((state) => state.progress >= 0.98)
      .take(1)
      .compose(delay(10e3)),
  );

  const req$ = xs.merge(
    sources.props
      .map((props) =>
        props.continuation
          ? xs.never()
          : xs.of<Req>({type: 'db.compact'} as Req),
      )
      .flatten(),

    doneCompacting$.mapTo({type: 'dbUtils.warmUpJITDB'} as Req),
  );

  const goToRoot$ = doneCompacting$
    .compose(delay(800))
    .mapTo({type: 'popToRoot'} as Command);

  return {
    screen: vdom$,
    navigation: goToRoot$,
    state: reducer$,
    ssb: req$,
    toast: dummyToast$,
  };
}
