/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
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

  const stopAndDestroy$ = xs
    .merge(actions.requestStopRecording$, actions.discardRecording$)
    .compose(sample(state$))
    .map((state) =>
      state.status === 'recording'
        ? xs.of(
            {type: 'stop', filename: state.filename} as RecorderCommand,
            {type: 'destroy', filename: state.filename} as RecorderCommand,
          )
        : xs.of({type: 'destroy', filename: state.filename} as RecorderCommand),
    )
    .flatten();

  return xs.merge(prepare$, record$, stopAndDestroy$);
}
