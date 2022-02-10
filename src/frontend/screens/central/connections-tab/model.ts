// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import concat from 'xstream/extra/concat';
import {FeedId} from 'ssb-typescript';
import {State as AppState} from '~frontend/drivers/appstate';
import {NetworkSource} from '~frontend/drivers/network';
import {SSBSource} from '~frontend/drivers/ssb';
import {WindowSize} from '~frontend/drivers/window-size';
import {PeerKV, StagedPeerKV} from '~frontend/ssb/types';

export type Recommendation =
  | 'follow-staged-manually'
  | 'consume-invite'
  | 'paste-invite'
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
    | `${Recommendation}#${Recommendation}#${Recommendation}`
    | `${Recommendation}#${Recommendation}#${Recommendation}#${Recommendation}`;
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

function reevaluateStatus(prev: State): State {
  const roomsNum = prev.rooms.filter((p) => p[1].state === 'connected').length;
  const connectedNum = prev.peers.filter(
    (p) => p[1].state === 'connected',
  ).length;
  const stagedNum = prev.stagedPeers.length;
  const stagedLanNum = prev.stagedPeers.filter(
    (p) => p[1].type === 'lan',
  ).length;
  const {internetEnabled, postsCount} = prev;

  if (!internetEnabled && connectedNum === 0 && stagedNum === 0) {
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

  if (connectedNum === 0 && stagedLanNum > 0) {
    return {
      ...prev,
      scenario: 'nearby-strangers-available',
      status: 'bad',
      bestRecommendation: 'follow-staged-manually',
      otherRecommendations: internetEnabled
        ? 'consume-invite#paste-invite#host-ssb-room'
        : '',
    };
  }

  if (connectedNum === 0 && stagedNum === 0) {
    return {
      ...prev,
      scenario: 'knows-no-one',
      status: 'bad',
      bestRecommendation: 'consume-invite',
      otherRecommendations: 'paste-invite#host-ssb-room',
    };
  }

  if (connectedNum === 0 && roomsNum > 0) {
    return {
      ...prev,
      scenario: 'empty-rooms',
      status: 'bad',
      bestRecommendation: 'follow-staged-manually',
      otherRecommendations: 'consume-invite#paste-invite#host-ssb-room',
    };
  }

  if (connectedNum > 0 && connectedNum < 2) {
    return {
      ...prev,
      scenario: 'connected-poorly',
      status: 'fair',
      bestRecommendation: 'consume-invite',
      otherRecommendations: 'paste-invite#host-ssb-room',
    };
  }

  if (connectedNum >= 2 && stagedNum > 0) {
    return {
      ...prev,
      scenario: 'connected-well',
      status: 'good',
      bestRecommendation: null,
      otherRecommendations:
        'follow-staged-manually#consume-invite#paste-invite#host-ssb-room',
    };
  }

  if (connectedNum >= 2 && stagedNum === 0) {
    return {
      ...prev,
      scenario: 'connected-well',
      status: 'good',
      bestRecommendation: null,
      otherRecommendations: 'consume-invite#paste-invite#host-ssb-room',
    };
  }

  return prev;
}

export default function model(
  ssbSource: SSBSource,
  networkSource: NetworkSource,
  appstate$: Stream<AppState>,
  windowSize$: Stream<WindowSize>,
  state$: Stream<State>,
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

  const setPeersReducer$ = onlyWhileAppIsInForeground(
    appstate$,
    () => ssbSource.peers$,
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

  const setStagedPeersReducer$ = onlyWhileAppIsInForeground(
    appstate$,
    () => ssbSource.stagedPeers$,
  ).map(
    (allStagedPeers) =>
      function setStagedPeersReducer(prev: State): State {
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

  const updatePeersAbout$ = xs
    .periodic(10e3)
    .compose(sample(state$))
    .map((state) => {
      if (!state.isVisible) return xs.of(null);
      if (state.peers.length === 0) return xs.of(null);
      return xs.combine(
        ...state.peers.map(([_addr, data]) =>
          data.key ? ssbSource.profileAbout$(data.key) : xs.of(null),
        ),
      );
    })
    .flatten()
    .filter((abouts) => !!abouts)
    .map(
      (x) =>
        function updatePeersAbout(prev: State): State {
          const abouts = x as NonNullable<typeof x>;
          const peers: typeof prev.peers = prev.peers.map((peer, i) => {
            if (abouts[i] && abouts[i]!.imageUrl) {
              const [addr, data] = peer;
              return [addr, {...data, ...abouts[i]}];
            } else {
              return peer;
            }
          });
          return {...prev, peers, timestampPeersAndRooms: Date.now()};
        },
    );

  const reducer$ = xs.merge(
    updateLanEnabled$,
    updateInternetEnabled$,
    updateWindowSizeReducer$,
    updatePostsCountReducer$,
    setPeersReducer$,
    setStagedPeersReducer$,
    updatePeersAbout$,
  );

  // As a post-processing step, apply reevaluateStatus after all reducers
  return reducer$.map((reducer) => (prev: State) => {
    const next = reducer(prev);
    if (next === prev) return next;
    else return reevaluateStatus(next);
  });
}
