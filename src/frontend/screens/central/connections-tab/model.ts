// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {State as AppState} from '../../../drivers/appstate';
import {SSBSource} from '../../../drivers/ssb';
import {PeerKV, StagedPeerKV} from '../../../ssb/types';
import sample from 'xstream-sample';

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  isVisible: boolean;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV>;
  stagedPeers: Array<StagedPeerKV>;
  timestampPeersAndRooms: number;
  timestampStagedPeers: number;
}

/**
 * Listen to the `factory()` stream only while the AppState is 'active'.
 */
function onlyWhileAppIsInForeground<T>(
  appstate$: Stream<AppState>,
  factory: () => Stream<T>,
): Stream<T> {
  return appstate$
    .startWith('active')
    .map((appstate) => {
      if (appstate === 'active') {
        return factory();
      } else {
        return xs.never() as Stream<T>;
      }
    })
    .flatten();
}

function sampledEvery<T>(period: number): (ins: Stream<T>) => Stream<T> {
  return function sampledEveryOperator(ins: Stream<T>) {
    return xs.periodic(period).startWith(0).compose(sample(ins));
  };
}

export default function model(
  ssbSource: SSBSource,
  appstate$: Stream<AppState>,
) {
  const setPeersReducer$ = onlyWhileAppIsInForeground(appstate$, () =>
    ssbSource.peers$.compose(sampledEvery(500)),
  ).map(
    (allPeers) =>
      function setPeersReducer(prev: State): State {
        const peers = allPeers.filter(
          ([, data]) => (data.type as any) !== 'room',
        );
        const rooms = allPeers.filter(
          ([, data]) => (data.type as any) === 'room',
        );
        return {...prev, peers, rooms, timestampPeersAndRooms: Date.now()};
      },
  );

  const setStagedPeersReducer$ = onlyWhileAppIsInForeground(appstate$, () =>
    ssbSource.stagedPeers$.compose(sampledEvery(500)),
  ).map(
    (stagedPeers) =>
      function setPeersReducer(prev: State): State {
        return {...prev, stagedPeers, timestampStagedPeers: Date.now()};
      },
  );

  return xs.merge(setPeersReducer$, setStagedPeersReducer$);
}
