// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Recorder} from '@staltz/react-native-audio-toolkit';
import {Command, Response} from './types';

export function makeRecorderDriver() {
  const recs = new Map<string, Recorder>();
  const res$ = xs.create<Response>();

  return function recorderDriver(sink$: Stream<Command>): Stream<Response> {
    sink$.addListener({
      next: (cmd) => {
        if (cmd.type === 'prepare') {
          if (recs.has(cmd.filename)) {
            console.error('cannot prepare Recorder twice');
            return;
          }
          const rec = new Recorder(cmd.filename, cmd.opts as any);
          rec.prepare((err, path) => {
            if (err) res$._e(err);
            else res$._n({type: 'prepared', filename: cmd.filename, path});
          });
          (rec as any).on('meter', (data: any) => {
            res$._n({
              type: 'meter',
              value: data.value,
              rawValue: data.rawValue,
            });
          });
          recs.set(cmd.filename, rec);
          return;
        }

        if (cmd.type === 'record') {
          if (!recs.has(cmd.filename)) {
            console.error(
              `cannot record ${cmd.filename} because we have not prepared it`,
            );
            return;
          }
          const rec = recs.get(cmd.filename)!;
          rec.record((err) => {
            if (err) res$._e(err);
            else res$._n({type: 'recording', filename: cmd.filename});
          });
          return;
        }

        if (cmd.type === 'stop') {
          if (!recs.has(cmd.filename)) {
            console.error(
              `cannot stop ${cmd.filename} because we have not prepared it`,
            );
            return;
          }
          const rec = recs.get(cmd.filename)!;
          rec.stop((err) => {
            if (err) res$._e(err);
            else {
              res$._n({type: 'recorded', filename: cmd.filename});
            }
          });
          return;
        }

        if (cmd.type === 'destroy') {
          if (!recs.has(cmd.filename)) {
            console.warn(
              `cannot destroy ${cmd.filename} because we have not prepared it`,
            );
            return;
          }
          const rec = recs.get(cmd.filename)!;
          rec.destroy((err) => {
            if (err) res$._e(err);
            else {
              res$._n({type: 'destroyed', filename: cmd.filename});
              recs.delete(cmd.filename);
            }
          });
          return;
        }
      },
    });

    return res$;
  };
}
