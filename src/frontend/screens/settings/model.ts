/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {SSBSource} from '../../drivers/ssb';

type UnwrapArray<T> = T extends Array<infer X> ? X : never;

export const blobsStorageOptions = [
  '100MB' as const,
  '250MB' as const,
  '500MB' as const,
  '1GB' as const,
  '2GB' as const,
  '5GB' as const,
  '10GB' as const,
  '30GB' as const,
  'unlimited' as const,
];

export const hopsOptions = [
  '1' as const,
  '2' as const,
  '3' as const,
  '4' as const,
  'unlimited' as const,
];

export const fontSizeOptions = [
  '14' as const,
  '16' as const,
  '18' as const,
  '20' as const,
  '22' as const,
  '24' as const,
];

export type BlobsStorageOption = UnwrapArray<typeof blobsStorageOptions>;
export type HopsOption = UnwrapArray<typeof hopsOptions>;
export type FontSizeOption = UnwrapArray<typeof fontSizeOptions>;

const DEFAULT_HOPS: HopsOption = '2';
const DEFAULT_BLOBS_STORAGE: BlobsStorageOption = 'unlimited';
const DEFAULT_FONT_SIZE: FontSizeOption = '16';

export type State = {
  initialHops: number;
  initialBlobsStorage: number;
  initialFontSize: number;
  showFollows: boolean;
  enableDetailedLogs: boolean;
};

type Actions = {
  toggleFollowEvents$: Stream<boolean>;
  toggleDetailedLogs$: Stream<boolean>;
};

function hopsToOpt(hops?: number): HopsOption {
  if (typeof hops !== 'number') return DEFAULT_HOPS;
  if (hops >= 999) return 'unlimited';
  if (hops === 1) return '1';
  if (hops === 2) return '2';
  if (hops === 3) return '3';
  if (hops === 4) return '4';
  return DEFAULT_HOPS;
}

function blobsStorageToOpt(blobsStorage?: number): BlobsStorageOption {
  if (typeof blobsStorage !== 'number') return DEFAULT_BLOBS_STORAGE;
  if (blobsStorage < 0) return 'unlimited';
  if (blobsStorage === 100e6) return '100MB';
  if (blobsStorage === 250e6) return '250MB';
  if (blobsStorage === 500e6) return '500MB';
  if (blobsStorage === 1e9) return '1GB';
  if (blobsStorage === 2e9) return '2GB';
  if (blobsStorage === 5e9) return '5GB';
  if (blobsStorage === 10e9) return '10GB';
  if (blobsStorage === 30e9) return '30GB';
  return DEFAULT_BLOBS_STORAGE;
}

function fontSizeToOpt(fontSize?: number): FontSizeOption {
  if (typeof fontSize !== 'number') return DEFAULT_FONT_SIZE;
  if (fontSize === 1) return '14';
  if (fontSize === 2) return '16';
  if (fontSize === 3) return '18';
  if (fontSize === 4) return '20';
  if (fontSize === 5) return '22';
  if (fontSize === 6) return '24';
  return DEFAULT_FONT_SIZE;
}

export default function model(actions: Actions, ssbSource: SSBSource) {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;

    return {
      showFollows: true,
      enableDetailedLogs: false,
      initialHops: hopsOptions.indexOf(DEFAULT_HOPS),
      initialBlobsStorage: blobsStorageOptions.indexOf(DEFAULT_BLOBS_STORAGE),
      initialFontSize: fontSizeOptions.indexOf(DEFAULT_FONT_SIZE),
    };
  });

  const readSettingsReducer$ = ssbSource.readSettings().map(
    (settings) =>
      function readSettingsReducer(prev: State): State {
        return {
          ...prev,
          showFollows: settings.showFollows ?? prev.showFollows,
          initialHops: hopsOptions.indexOf(hopsToOpt(settings.hops)),
          initialBlobsStorage: blobsStorageOptions.indexOf(
            blobsStorageToOpt(settings.blobsStorageLimit),
          ),
          enableDetailedLogs: settings.detailedLogs ?? prev.enableDetailedLogs,
          initialFontSize: fontSizeOptions.indexOf(
            fontSizeToOpt(settings.fontSize),
          ),
        };
      },
  );

  const toggleFollowEventsReducer$ = actions.toggleFollowEvents$.map(
    (showFollows) =>
      function toggleFollowEventsReducer(prev: State): State {
        return {...prev, showFollows};
      },
  );

  const toggleDetailedLogsReducer$ = actions.toggleDetailedLogs$.map(
    (enableDetailedLogs) =>
      function toggleDetailedLogsReducer(prev: State): State {
        return {...prev, enableDetailedLogs};
      },
  );

  return xs.merge(
    initReducer$,
    readSettingsReducer$,
    toggleFollowEventsReducer$,
    toggleDetailedLogsReducer$,
  );
}
