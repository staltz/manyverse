// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
) {
  const backWithState$ = xs
    .merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    )
    .compose(sample(state$));

  const backDuringIdle$ = backWithState$.filter(
    (state) => state.status === 'idle',
  );

  return {
    backDuringIdle$,
  };
}
