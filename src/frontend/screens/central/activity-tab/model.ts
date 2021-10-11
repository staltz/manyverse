// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {GetReadable, SSBSource} from '../../../drivers/ssb';
import {FirewallAttempt, MsgAndExtras} from '../../../ssb/types';
const interleave = require('pull-sorted-interleave');

export type ActivityItem = MsgAndExtras | FirewallAttempt;

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  lastSessionTimestamp: number;
  getActivityFeedReadable: GetReadable<ActivityItem> | null;
  isVisible: boolean;
  numOfUpdates: number;
};

interface Actions {
  refreshFeed$: Stream<any>;
}

export function isMsg(item: ActivityItem): item is MsgAndExtras {
  return !!(item as MsgAndExtras).key;
}

function sortByDescendingTimestamp(a: ActivityItem, b: ActivityItem) {
  const tsA = isMsg(a) ? a.timestamp : a.ts;
  const tsB = isMsg(b) ? b.timestamp : b.ts;
  return tsB - tsA;
}

export default function model(ssbSource: SSBSource, actions: Actions) {
  /**
   * Wait for some time, to give priority to other queries at startup-time
   * such as those for the public-tab, which must appear before.
   */
  const initialWait$ = xs.periodic(5000).take(1);

  const setActivityFeedReducer$ = initialWait$
    .map(() => xs.combine(ssbSource.mentionsFeed$, ssbSource.firewallAttempt$))
    .flatten()
    .map(
      ([getMentionsSource, getAttemptsSource]) =>
        function setActivityFeedReducer(prev: State): State {
          const getActivityFeedReadable = () =>
            interleave(
              [getMentionsSource(), getAttemptsSource()],
              sortByDescendingTimestamp,
            );
          return {...prev, getActivityFeedReadable};
        },
    );

  const incUpdatesReducer$ = initialWait$
    .map(() =>
      xs.merge(ssbSource.mentionsFeedLive$, ssbSource.firewallAttemptLive$),
    )
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
