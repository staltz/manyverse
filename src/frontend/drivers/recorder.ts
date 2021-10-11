// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Recorder} from '@staltz/react-native-audio-toolkit';

export type Command =
  | {
      type: 'prepare';
      filename: string;
      opts?: {
        format?: 'mp4' | 'aac' | 'ogg' | 'webm' | 'amr';
        encoder?: 'mp4' | 'aac' | 'ogg' | 'webm' | 'amr';
        channels?: number;
        sampleRate?: number;
        bitrate?: number;
        meteringInterval?: number;
      };
    }
  | {
      type: 'record';
      filename: string;
    }
  | {
      type: 'stop';
      filename: string;
    }
  | {
      type: 'destroy';
      filename: string;
    };

export type Response =
  | {type: 'prepared'; filename: string; path: string}
  | {type: 'recording'; filename: string}
  | {type: 'recorded'; filename: string}
  | {type: 'destroyed'; filename: string}
  | {type: 'meter'; value: number; rawValue: number};

export function makeRecorderDriver() {
  const recs = new Map<string, Recorder>();
  const res$ = xs.create<Response>();

  return function lifecycleDriver(sink$: Stream<Command>): Stream<Response> {
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
