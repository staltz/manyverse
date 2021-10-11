// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {FeedId} from 'ssb-typescript';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  lastSessionTimestamp?: number;
  selfFeedId?: FeedId;
  selfAvatarUrl?: string;
};

export default function model(
  ssbSource: SSBSource,
  asyncStorageSource: AsyncStorageSource,
) {
  const aboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map((selfFeedId) =>
      ssbSource.profileImage$(selfFeedId).map(
        (selfAvatarUrl) =>
          function aboutReducer(prev?: State): State {
            return {...(prev ?? {}), selfFeedId, selfAvatarUrl};
          },
      ),
    )
    .flatten();

  const lastSessionTimestampReducer$ = asyncStorageSource
    .getItem('lastSessionTimestamp')
    .map(
      (resultStr) =>
        function lastSessionTimestampReducer(prev?: State): State {
          const lastSessionTimestamp = parseInt(resultStr ?? '', 10);
          if (isNaN(lastSessionTimestamp)) {
            return prev ?? {};
          } else {
            return {...prev, lastSessionTimestamp};
          }
        },
    );

  return xs.merge(aboutReducer$, lastSessionTimestampReducer$);
}
