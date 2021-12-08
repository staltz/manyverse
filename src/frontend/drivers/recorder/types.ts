// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
