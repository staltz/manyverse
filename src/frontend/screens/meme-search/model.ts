// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';

export interface State {
  status: 'idle' | 'recording' | 'finalizing' | 'recorded';
  path: string | null;
  blobId: string | null;
  startedRecordingAt: number;
  duration: number;
  loudness: number;
}

interface Actions {}

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
  state$: Stream<State>,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initOrResetReducer(_prev?: State): State {
    return {
      status: 'idle',
      path: null,
      blobId: null,
      startedRecordingAt: 0,
      duration: 0,
      loudness: 0,
    };
  });
  return xs.merge(initReducer$);
}
