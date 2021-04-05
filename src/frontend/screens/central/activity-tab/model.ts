/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {GetReadable, SSBSource} from '../../../drivers/ssb';
import {MsgAndExtras} from '../../../ssb/types';

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  lastSessionTimestamp: number;
  getActivityFeedReadable: GetReadable<MsgAndExtras> | null;
  isVisible: boolean;
  numOfUpdates: number;
};

interface Actions {
  refreshFeed$: Stream<any>;
}

export default function model(ssbSource: SSBSource, actions: Actions) {
  /**
   * Wait for some time, to give priority to other queries at startup-time
   * such as those for the public-tab, which must appear before.
   */
  const initialWait$ = xs.periodic(5000).take(1);

  const setActivityFeedReducer$ = initialWait$
    .map(() => ssbSource.mentionsFeed$)
    .flatten()
    .map(
      (getReadable) =>
        function setActivityFeedReducer(prev: State): State {
          return {...prev, getActivityFeedReadable: getReadable};
        },
    );

  const incUpdatesReducer$ = initialWait$
    .map(() => ssbSource.mentionsFeedLive$)
    .flatten()
    .mapTo(function incUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: prev.numOfUpdates + 1};
    });

  const resetUpdatesReducer$ = actions.refreshFeed$.mapTo(
    function resetUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: 0};
    },
  );

  return xs.merge(
    setActivityFeedReducer$,
    incUpdatesReducer$,
    resetUpdatesReducer$,
  );
}
