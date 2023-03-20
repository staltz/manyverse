// SPDX-FileCopyrightText: 2020-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {SSBSource} from '~frontend/drivers/ssb';

export interface State {
  firstVisit?: number;
  lastSessionTimestamp?: number;
  selfFeedId?: FeedId;
  selfAvatarUrl?: string;

  /**
   * - `undefined` means "not yet loaded"
   * - `null` means loaded but the user has not yet made a choice
   * - `true` means the user chose to allow checking new versions
   * - `false` means the user chose to reject checking new versions
   */
  allowCheckingNewVersion: boolean | null | undefined;
}

interface Actions {
  readCheckingNewVersionSetting$: Stream<boolean | null>;
}

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
  asyncStorageSource: AsyncStorageSource,
) {
  const aboutReducer$ = ssbSource.selfFeedId$
    .filter((selfFeedId) => !!selfFeedId)
    .map((selfFeedId: string) =>
      ssbSource
        .profileAbout$(selfFeedId)
        .take(1)
        .map(
          (about) =>
            function aboutReducer(prev?: State): State {
              const initial = prev ?? {allowCheckingNewVersion: undefined};
              return {
                ...initial,
                selfFeedId,
                selfAvatarUrl: about.imageUrl,
              };
            },
        ),
    )
    .flatten();

  const firstVisitReducer$ = asyncStorageSource
    .getItem('firstVisit')
    .filter((resultStr: string | null) => !!resultStr)
    .map(
      (resultStr: string) =>
        function firstVisitReducer(prev?: State): State {
          const initial = prev ?? {allowCheckingNewVersion: undefined};
          const firstVisit = parseInt(resultStr, 10);
          if (isNaN(firstVisit)) {
            return initial;
          } else {
            return {...initial, firstVisit};
          }
        },
    );

  const lastSessionTimestampReducer$ = asyncStorageSource
    .getItem('lastSessionTimestamp')
    .map(
      (resultStr) =>
        function lastSessionTimestampReducer(prev?: State): State {
          const initial = prev ?? {allowCheckingNewVersion: undefined};
          const lastSessionTimestamp = parseInt(resultStr ?? '', 10);
          if (isNaN(lastSessionTimestamp)) {
            return initial;
          } else {
            return {
              ...initial,
              lastSessionTimestamp,
            };
          }
        },
    );

  const initialAllowCheckingNewVersionReducer$ =
    actions.readCheckingNewVersionSetting$.map(
      (value) =>
        function initialAllowCheckingNewVersionReducer(prev: State): State {
          return {
            ...prev,
            allowCheckingNewVersion: value,
          };
        },
    );

  return xs.merge(
    aboutReducer$,
    firstVisitReducer$,
    lastSessionTimestampReducer$,
    initialAllowCheckingNewVersionReducer$,
  );
}
