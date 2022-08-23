// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {Reducer} from '@cycle/state';
import {SSBSource} from '~frontend/drivers/ssb';
import progressCalculation, {
  State as ProgressState,
} from '~frontend/components/progressCalculation';
import {Props} from './props';

export interface State extends ProgressState {
  logSize: number;
}

export default function model(props$: Stream<Props>, ssbSource: SSBSource) {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {...props, logSize: 0};
      },
  );

  const progressReducer$ = progressCalculation(ssbSource) as Stream<
    Reducer<State>
  >;

  const readLogSizeReducer$ = ssbSource.storageStats$().map(
    (stats) =>
      function readLogSizeReducer(prev: State): State {
        return {...prev, logSize: stats.log};
      },
  );

  return concat(propsReducer$, xs.merge(progressReducer$, readLogSizeReducer$));
}
