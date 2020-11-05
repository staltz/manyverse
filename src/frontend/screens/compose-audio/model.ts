/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {Response as RecorderResponse} from '../../drivers/recorder';
import {Platform} from 'react-native';

export type State = {
  filename: string;
  status: 'idle' | 'recording' | 'finalizing' | 'recorded';
  path: string | null;
  startedRecordingAt: number;
  duration: number;
  loudness: number;
};

type Actions = {
  responseStartRecording$: Stream<any>;
  requestStopRecording$: Stream<any>;
  responseStopRecording$: Stream<any>;
  discardRecording$: Stream<any>;
  meterEvent$: Stream<number>;
};

export default function model(
  actions: Actions,
  recorderEvent$: Stream<RecorderResponse>,
): Stream<Reducer<State>> {
  const initOrResetReducer$ = actions.discardRecording$.startWith(null).map(
    () =>
      function initOrResetReducer(_prev?: State): State {
        const ext = Platform.OS === 'ios' ? 'mp4' : 'mp3';
        return {
          filename: `${Date.now()}.${ext}`,
          status: 'idle',
          path: null,
          startedRecordingAt: 0,
          duration: 0,
          loudness: 0,
        };
      },
  );

  const updatePathReducer$ = recorderEvent$
    .filter((ev) => ev.type === 'prepared')
    .map(
      (ev) =>
        function updatePathReducer(prev: State): State {
          return {...prev, path: (ev as any).path};
        },
    );

  const startReducer$ = actions.responseStartRecording$.map(
    () =>
      function startReducer(prev: State): State {
        return {...prev, status: 'recording', startedRecordingAt: Date.now()};
      },
  );

  const updateLoudnessReducer$ = actions.meterEvent$.map(
    (value) =>
      function updateLoudnessReducer(prev: State): State {
        return {...prev, loudness: Math.max(0, Math.min((value + 60) / 60, 1))};
      },
  );

  const updateDurationReducer$ = actions.responseStartRecording$
    .map(() => xs.periodic(333).endWhen(actions.requestStopRecording$))
    .flatten()
    .map(
      () =>
        function updateDurationReducer(prev: State): State {
          return {
            ...prev,
            duration: (Date.now() - prev.startedRecordingAt) * 0.001,
          };
        },
    );

  const finalizeReducer$ = actions.requestStopRecording$.map(
    () =>
      function finalizeReducer(prev: State): State {
        return {...prev, status: 'finalizing'};
      },
  );

  const stopReducer$ = actions.responseStopRecording$.map(
    () =>
      function stopReducer(prev: State): State {
        return {...prev, status: 'recorded'};
      },
  );

  return xs.merge(
    initOrResetReducer$,
    updatePathReducer$,
    startReducer$,
    updateLoudnessReducer$,
    updateDurationReducer$,
    finalizeReducer$,
    stopReducer$,
  );
}
