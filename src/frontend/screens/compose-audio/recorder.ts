// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
import pairwise from 'xstream/extra/pairwise';
import {Command as RecorderCommand} from '../../drivers/recorder';
import {State} from './model';

type Actions = {
  requestStartRecording$: Stream<any>;
  requestStopRecording$: Stream<any>;
  discardRecording$: Stream<any>;
};

export default function recorder(actions: Actions, state$: Stream<State>) {
  const filename$ = state$.map((s) => s.filename).compose(dropRepeats());

  const prepare$ = filename$.map(
    (filename) =>
      ({
        type: 'prepare',
        filename,
        opts: {
          channels: 1,
          format: 'mp4',
          encoder: 'mp4',
          meteringInterval: 150,
        },
      } as RecorderCommand),
  );

  const record$ = actions.requestStartRecording$
    .compose(sample(filename$))
    .map((filename) => ({type: 'record', filename} as RecorderCommand));

  const destroyPrevious$ = filename$
    .compose(pairwise)
    .map(
      ([prevFilename, _nextFilename]) =>
        ({type: 'destroy', filename: prevFilename} as RecorderCommand),
    );

  const stopAndDestroy$ = actions.requestStopRecording$
    .compose(sample(state$))
    .map((state) =>
      state.status === 'recording'
        ? xs.of(
            {type: 'stop', filename: state.filename} as RecorderCommand,
            {type: 'destroy', filename: state.filename} as RecorderCommand,
          )
        : xs.never(),
    )
    .flatten();

  return xs.merge(prepare$, record$, stopAndDestroy$, destroyPrevious$);
}
