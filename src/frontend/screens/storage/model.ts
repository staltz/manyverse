// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Reducer} from '@cycle/state';
import {FeedId} from 'ssb-typescript';
import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {GetReadable, SSBSource} from '~frontend/drivers/ssb';
import {StorageUsedByFeed} from '~frontend/ssb/types';

import {Props} from './props';

export interface State {
  selfFeedId: FeedId;
  getStorageUsedReadable: GetReadable<StorageUsedByFeed> | null;
  initialBlobsStorage: number;
  trashBytes: number | null;
  contentBytes: number | null;
  indexesBytes: number | null;
  blobsBytes: number | null;
}

type UnwrapArray<T> = T extends Array<infer X> ? X : never;

export const blobsStorageOptions = [
  '100 MB' as const,
  '250 MB' as const,
  '500 MB' as const,
  '1 GB' as const,
  '2 GB' as const,
  '5 GB' as const,
  '10 GB' as const,
  '30 GB' as const,
  'unlimited' as const,
];

export type BlobsStorageOption = UnwrapArray<typeof blobsStorageOptions>;

const DEFAULT_BLOBS_STORAGE: BlobsStorageOption = '500 MB';

function blobsStorageToOpt(blobsStorage?: number): BlobsStorageOption {
  if (typeof blobsStorage !== 'number') return DEFAULT_BLOBS_STORAGE;
  if (blobsStorage < 0) return 'unlimited';
  if (blobsStorage === 100e6) return '100 MB';
  if (blobsStorage === 250e6) return '250 MB';
  if (blobsStorage === 500e6) return '500 MB';
  if (blobsStorage === 1e9) return '1 GB';
  if (blobsStorage === 2e9) return '2 GB';
  if (blobsStorage === 5e9) return '5 GB';
  if (blobsStorage === 10e9) return '10 GB';
  if (blobsStorage === 30e9) return '30 GB';
  return DEFAULT_BLOBS_STORAGE;
}

export function blobsOptToStorage(opt: BlobsStorageOption): number {
  if (opt === '100 MB') return 100e6;
  if (opt === '250 MB') return 250e6;
  if (opt === '500 MB') return 500e6;
  if (opt === '1 GB') return 1e9;
  if (opt === '2 GB') return 2e9;
  if (opt === '5 GB') return 5e9;
  if (opt === '10 GB') return 10e9;
  if (opt === '30 GB') return 30e9;
  if (opt === 'unlimited') return -1;
  return -1 as number;
}

export default function model(
  props$: Stream<Props>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          selfFeedId: props.selfFeedId,
          getStorageUsedReadable: null,
          initialBlobsStorage: blobsStorageOptions.indexOf(
            DEFAULT_BLOBS_STORAGE,
          ),
          trashBytes: null,
          contentBytes: null,
          indexesBytes: null,
          blobsBytes: null,
        };
      },
  );

  const setStorageUsedListReducer$ = ssbSource.bytesUsedReadable$().map(
    (getStorageUsedReadable) =>
      function setStorageChunks(prev: State): State {
        return {...prev, getStorageUsedReadable};
      },
  );

  const readSettingsReducer$ = ssbSource.readSettings().map(
    (settings) =>
      function readSettingsReducer(prev: State): State {
        return {
          ...prev,
          initialBlobsStorage: blobsStorageOptions.indexOf(
            blobsStorageToOpt(settings.blobsStorageLimit),
          ),
        };
      },
  );

  const setStatsReducer$ = xs
    .periodic(2000)
    .startWith(0)
    .map(() => ssbSource.storageStats$())
    .flatten()
    .map(
      (stats) =>
        function setStatsReducer(prev: State): State {
          return {
            ...prev,
            trashBytes: stats.logDeletedBytes,
            contentBytes: stats.log - stats.logDeletedBytes,
            indexesBytes: stats.indexes + stats.jitIndexes,
            blobsBytes: stats.blobs,
          };
        },
    );

  return concat(
    propsReducer$,
    xs.merge(
      setStorageUsedListReducer$,
      readSettingsReducer$,
      setStatsReducer$,
    ),
  );
}
