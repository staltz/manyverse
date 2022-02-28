// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import concat from 'xstream/extra/concat';
import dropRepeats from 'xstream/extra/dropRepeats';
import {FeedId} from 'ssb-typescript';
import {NetworkSource} from '~frontend/drivers/network';
import {SSBSource} from '~frontend/drivers/ssb';
import {PeerKV, StagedPeerKV} from '~frontend/ssb/types';
import delay from 'xstream/extra/delay';

export interface State {
  selfFeedId: FeedId;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV>;
  stagedPeers: Array<StagedPeerKV>;
  connectedToSomeone: boolean;
  timestampPeersAndRooms: number;
  timestampStagedPeers: number;
  logSize: number;
  progressToSkip: number;
}

export default function model(
  networkSource: NetworkSource,
  ssbSource: SSBSource,
) {
  const initReducer$ = ssbSource.selfFeedId$.take(1).map(
    (selfFeedId: FeedId) =>
      function initReducer(prev: State): State {
        return {
          selfFeedId,
          internetEnabled: false,
          lanEnabled: false,
          peers: [],
          rooms: [],
          stagedPeers: [],
          connectedToSomeone: false,
          timestampPeersAndRooms: Date.now(),
          timestampStagedPeers: Date.now(),
          logSize: 0,
          progressToSkip: 0,
        };
      },
  );

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

  const setStagedPeersReducer$ = ssbSource.stagedPeers$.map(
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

  const setPeersReducer$ = ssbSource.peers$.map(
    (allPeers) =>
      function setPeersReducer(prev: State): State {
        const peers = allPeers.filter(
          ([, data]) => (data.type as any) !== 'room',
        );
        const rooms = allPeers.filter(
          ([, data]) => (data.type as any) === 'room',
        );
        const connectedPeers = peers.filter((p) => p[1].state === 'connected');
        return {
          ...prev,
          peers,
          rooms,
          connectedToSomeone: connectedPeers.length > 0,
          timestampPeersAndRooms: Date.now(),
        };
      },
  );

  const logSize$ = ssbSource
    .getLogSize$()
    .filter((logSize) => logSize > 0)
    .compose(dropRepeats());

  const updateLogSizeReducer$ = logSize$.map(
    (logSize) =>
      function updateLogSizeReducer(prev: State): State {
        return {...prev, logSize, progressToSkip: 0};
      },
  );

  const UPDATE_RATE = 100; // ms
  const PROGRESS_INIT_DELAY = 1000; // ms
  const PROGRESS_TOTAL_WAIT = 10000; // ms
  const UPDATE_COUNT = Math.ceil(
    (PROGRESS_TOTAL_WAIT - PROGRESS_INIT_DELAY) / UPDATE_RATE,
  );

  const updateProgressToSkipReducer$ = logSize$
    .map(() =>
      xs
        .periodic(UPDATE_RATE)
        .take(UPDATE_COUNT)
        .compose(delay(PROGRESS_INIT_DELAY)),
    )
    .flatten()
    .map(
      (i) =>
        function updateProgressToSkipReducer(prev: State): State {
          return {...prev, progressToSkip: Math.min(1, (i + 1) / UPDATE_COUNT)};
        },
    );

  return concat(
    initReducer$,
    xs.merge(
      updateLanEnabled$,
      updateInternetEnabled$,
      setStagedPeersReducer$,
      setPeersReducer$,
      updateLogSizeReducer$,
      updateProgressToSkipReducer$,
    ),
  );
}
