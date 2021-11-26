// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import concat from 'xstream/extra/concat';
import {FeedId} from 'ssb-typescript';
import {State as AppState} from '../../../drivers/appstate';
import {NetworkSource} from '../../../drivers/network';
import {SSBSource} from '../../../drivers/ssb';
import {WindowSize} from '../../../drivers/window-size';
import {PeerKV, StagedPeerKV} from '../../../ssb/types';

export type Recommendation =
  | 'follow-staged-manually'
  | 'consume-invite'
  | 'host-ssb-room';
// | 'qr-code-wifi-direct' TODO: issue #1591
// | 'send-tokenized-alias-invite' TODO: issue #1594

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  isVisible: boolean;
  lanEnabled: boolean;
  internetEnabled: boolean;
  initializedSSB: boolean;
  status: 'offline' | 'bad' | 'fair' | 'good';
  scenario:
    | 'offline-with-content'
    | 'offline-without-content'
    | 'nearby-strangers-available'
    | 'knows-no-one'
    | 'empty-rooms'
    | 'connected-poorly'
    | 'connected-well';
  postsCount: number;
  windowSize?: WindowSize;
  bestRecommendation: Recommendation | null;
  /**
   * To benefit from equality comparison, we avoid arrays and instead use
   * concatenated strings where the separator is #.
   */
  otherRecommendations:
    | ''
    | `${Recommendation}`
    | `${Recommendation}#${Recommendation}`
    | `${Recommendation}#${Recommendation}#${Recommendation}`;
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

function reevaluateStatus(prev: State): State {
  const roomsNum = prev.rooms.filter((p) => p[1].state === 'connected').length;
  const connectedNum = prev.peers.filter(
    (p) => p[1].state === 'connected',
  ).length;
  const stagedNum = prev.stagedPeers.length;
  const stagedLanNum = prev.stagedPeers.filter(
    (p) => p[1].type === 'lan',
  ).length;
  const {internetEnabled, lanEnabled, postsCount} = prev;

  if (!internetEnabled && stagedNum === 0 && stagedLanNum === 0) {
    if (postsCount > 2) {
      return {
        ...prev,
        scenario: 'offline-with-content',
        status: 'offline',
        bestRecommendation: null,
        otherRecommendations: '',
      };
    } else {
      return {
        ...prev,
        scenario: 'offline-without-content',
        status: 'offline',
        bestRecommendation: null,
        otherRecommendations: '',
      };
    }
  }

  if (!internetEnabled && lanEnabled && stagedLanNum > 0) {
    return {
      ...prev,
      scenario: 'nearby-strangers-available',
      status: 'bad',
      bestRecommendation: 'follow-staged-manually',
      otherRecommendations: '',
    };
  }

  if (connectedNum === 0 && stagedNum === 0) {
    return {
      ...prev,
      scenario: 'knows-no-one',
      status: 'bad',
      bestRecommendation: 'consume-invite',
      otherRecommendations: 'host-ssb-room',
    };
  }

  if (roomsNum > 0 && connectedNum === 0) {
    return {
      ...prev,
      scenario: 'empty-rooms',
      status: 'bad',
      bestRecommendation: 'follow-staged-manually',
      otherRecommendations: 'consume-invite#host-ssb-room',
    };
  }

  if (connectedNum > 0 && connectedNum < 2) {
    return {
      ...prev,
      scenario: 'connected-poorly',
      status: 'fair',
      bestRecommendation: 'consume-invite',
      otherRecommendations: 'host-ssb-room',
    };
  }

  if (connectedNum >= 2 && stagedNum > 0) {
    return {
      ...prev,
      scenario: 'connected-well',
      status: 'good',
      bestRecommendation: null,
      otherRecommendations:
        'follow-staged-manually#consume-invite#host-ssb-room',
    };
  }

  if (connectedNum >= 2 && stagedNum === 0) {
    return {
      ...prev,
      scenario: 'connected-well',
      status: 'good',
      bestRecommendation: null,
      otherRecommendations: 'consume-invite#host-ssb-room',
    };
  }

  return prev;
}

export default function model(
  ssbSource: SSBSource,
  networkSource: NetworkSource,
  appstate$: Stream<AppState>,
  windowSize$: Stream<WindowSize>,
) {
  const pingConnectivityModes$ = concat(
    xs.of(0),
    xs.periodic(2000).take(2),
    xs.periodic(6000),
  );

  const updateLanEnabled$ = pingConnectivityModes$
    .map(() => networkSource.wifiIsEnabled())
    .flatten()
    .map(
      (lanEnabled) =>
        function updateLanEnabled(prev: State): State {
          return {...prev, lanEnabled};
        },
    );

  const updateInternetEnabled$ = pingConnectivityModes$
    .map(() => networkSource.hasInternetConnection())
    .flatten()
    .map(
      (internetEnabled) =>
        function updateInternetEnabled(prev: State): State {
          return {...prev, internetEnabled};
        },
    );

  const updateWindowSizeReducer$ = windowSize$.map(
    (windowSize) =>
      function updateWindowSizeReducer(prev: State): State {
        return {...prev, windowSize};
      },
  );

  const updatePostsCountReducer$ = ssbSource.postsCount$().map(
    (postsCount) =>
      function updatePostsCountReducer(prev: State): State {
        return {...prev, postsCount};
      },
  );

  const setPeersReducer$ = onlyWhileAppIsInForeground(appstate$, () =>
    ssbSource.peers$.compose(sampledEvery(200)),
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
    ssbSource.stagedPeers$.compose(sampledEvery(200)),
  ).map(
    (allStagedPeers) =>
      function setPeersReducer(prev: State): State {
        const stagedPeers =
          !prev.internetEnabled && prev.lanEnabled
            ? allStagedPeers.filter(
                (p) => p[1].type === 'lan' || p[1].type === 'bt',
              )
            : allStagedPeers;
        return {
          ...prev,
          stagedPeers,
          timestampStagedPeers: Date.now(),
        };
      },
  );

  const reducer$ = xs.merge(
    updateLanEnabled$,
    updateInternetEnabled$,
    updateWindowSizeReducer$,
    updatePostsCountReducer$,
    setPeersReducer$,
    setStagedPeersReducer$,
  );

  // As a post-processing step, apply reevaluateStatus after all reducers
  return reducer$.map(
    (reducer) => (prev: State) => reevaluateStatus(reducer(prev)),
  );
}
