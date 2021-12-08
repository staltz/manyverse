// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Reducer} from '@cycle/state';
import {Platform} from 'react-native';
import {SSBSource} from '../../drivers/ssb';

export interface State {
  filename: string;
  status: 'idle' | 'recording' | 'finalizing' | 'recorded';
  path: string | null;
  blobId: string | null;
  startedRecordingAt: number;
  duration: number;
  loudness: number;
}

interface Actions {
  responseStartRecording$: Stream<any>;
  requestStopRecording$: Stream<any>;
  responseStopRecording$: Stream<any>;
  responsePreparedRecording$: Stream<{path: string}>;
  discardRecording$: Stream<any>;
  meterEvent$: Stream<number>;
}

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
  state$: Stream<State>,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initOrResetReducer(_prev?: State): State {
    const ext = Platform.select({ios: 'mp4', web: 'webm', default: 'mp3'});
    return {
      filename: `${Date.now()}.${ext}`,
      status: 'idle',
      path: null,
      blobId: null,
      startedRecordingAt: 0,
      duration: 0,
      loudness: 0,
    };
  });

  const resetReducer$ = actions.discardRecording$
    .compose(sample(state$))
    .map((state) =>
      state.blobId ? ssbSource.deleteBlob$(state.blobId) : xs.of(null),
    )
    .flatten()
    .map(
      () =>
        function initOrResetReducer(_prev?: State): State {
          const ext = Platform.select({
            ios: 'mp4',
            web: 'webm',
            default: 'mp3',
          });
          return {
            filename: `${Date.now()}.${ext}`,
            status: 'idle',
            path: null,
            blobId: null,
            startedRecordingAt: 0,
            duration: 0,
            loudness: 0,
          };
        },
    );

  const updatePathReducer$ = actions.responsePreparedRecording$.map(
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

  const stopReducer$ = actions.responseStopRecording$
    .compose(sample(state$))
    .map((state) => ssbSource.addBlobFromPath$(state.path!))
    .flatten()
    .map(
      (blobId) =>
        function stopReducer(prev: State): State {
          return {...prev, status: 'recorded', blobId};
        },
    );

  return xs.merge(
    initReducer$,
    resetReducer$,
    updatePathReducer$,
    startReducer$,
    updateLoudnessReducer$,
    updateDurationReducer$,
    finalizeReducer$,
    stopReducer$,
  );
}
