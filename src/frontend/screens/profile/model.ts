/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId} from 'ssb-typescript';
import {AboutAndExtras} from '../../ssb/types';
import {SSBSource, GetReadable} from '../../drivers/ssb';
import {Props} from './props';

export type State = {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  selfAvatarUrl?: string;
  displayFeedId: FeedId;
  about: AboutAndExtras;
  // FIXME: use `ThreadSummaryWithExtras` but somehow support reply summaries
  getFeedReadable: GetReadable<any> | null;
  blockingSecretly: boolean;
};

type Actions = {
  refreshFeed$: Stream<any>;
};

export default function model(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  props$: Stream<Props>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          selfFeedId: props.selfFeedId,
          selfAvatarUrl: props.selfAvatarUrl,
          displayFeedId: props.feedId,
          lastSessionTimestamp: Infinity,
          getFeedReadable: null,
          about: {
            name: props.feedId,
            description: '',
            id: props.feedId,
          },
          blockingSecretly: false,
        };
      },
  );

  const about$ = props$
    .map((props) => ssbSource.profileAboutLive$(props.feedId))
    .flatten();

  const updateAboutReducer$ = about$.map(
    (about) =>
      function updateAboutReducer(prev: State): State {
        return {...prev, about};
      },
  );

  const getFeedReadable$ = props$
    .map((props) => ssbSource.profileFeed$(props.feedId))
    .flatten();

  const loadLastSessionTimestampReducer$ = actions.refreshFeed$
    .startWith(null)
    .map(() =>
      asyncStorageSource.getItem('lastSessionTimestamp').map(
        (resultStr) =>
          function lastSessionTimestampReducer(prev: State): State {
            const lastSessionTimestamp = parseInt(resultStr ?? '', 10);
            if (isNaN(lastSessionTimestamp)) {
              return prev;
            } else {
              return {...prev, lastSessionTimestamp};
            }
          },
      ),
    )
    .flatten();

  const updateBlockingSecretlyReducer$ = props$
    .filter((props) => props.feedId !== props.selfFeedId)
    .map((props) => ssbSource.isPrivatelyBlocking$(props.feedId))
    .take(1)
    .flatten()
    .map(
      (blockingSecretly) =>
        function updateSecretlyBlockingReducer(prev: State): State {
          return {...prev, blockingSecretly};
        },
    );

  const updateFeedStreamReducer$ = getFeedReadable$.map(
    (getFeedReadable) =>
      function updateFeedStreamReducer(prev: State): State {
        return {...prev, getFeedReadable};
      },
  );

  return concat(
    propsReducer$,
    xs.merge(
      loadLastSessionTimestampReducer$,
      updateAboutReducer$,
      updateFeedStreamReducer$,
      updateBlockingSecretlyReducer$,
    ),
  );
}
