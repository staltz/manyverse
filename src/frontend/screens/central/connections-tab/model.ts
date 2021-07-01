/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {Platform} from 'react-native';
import {SSBSource} from '../../../drivers/ssb';
import {State as AppState} from '../../../drivers/appstate';
import {PeerKV, StagedPeerKV} from '../../../ssb/types';
import {NetworkSource} from '../../../drivers/network';

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  bluetoothEnabled: boolean;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV>;
  stagedPeers: Array<StagedPeerKV>;
  timestampPeersAndRooms: number;
  timestampStagedPeers: number;
  isVisible: boolean;
  bluetoothLastScanned: number;
  itemMenu: {
    opened: boolean;
    type: 'conn' | 'invite' | 'staging' | 'room' | 'staged-room';
    target?: PeerKV | StagedPeerKV;
  };
  latestInviteMenuTarget?: StagedPeerKV;
};

export type Actions = {
  pingConnectivityModes$: Stream<any>;
  openPeerInConnection$: Stream<PeerKV>;
  openStagedPeer$: Stream<StagedPeerKV>;
  openRoom$: Stream<PeerKV>;
  connectPeer$: Stream<any>;
  disconnectPeer$: Stream<any>;
  disconnectForgetPeer$: Stream<any>;
  forgetPeer$: Stream<any>;
  goToManageAliases$: Stream<any>;
  signInRoom$: Stream<any>;
  shareRoomInvite$: Stream<any>;
  closeItemMenu$: Stream<any>;
  goToPeerProfile$: Stream<any>;
};

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

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
  networkSource: NetworkSource,
  appstate$: Stream<AppState>,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {
      selfFeedId: '',
      bluetoothEnabled: false,
      lanEnabled: false,
      internetEnabled: false,
      isVisible: false,
      bluetoothLastScanned: 0,
      peers: [],
      rooms: [],
      stagedPeers: [],
      timestampPeersAndRooms: 0,
      timestampStagedPeers: 0,
      itemMenu: {opened: false, type: 'conn'},
    };
  });

  const updateBluetoothEnabled$ =
    Platform.OS === 'ios'
      ? xs.empty()
      : actions.pingConnectivityModes$
          .map(() => networkSource.bluetoothIsEnabled())
          .flatten()
          .map(
            (bluetoothEnabled) =>
              function updateBluetoothEnabled(prev: State): State {
                return {...prev, bluetoothEnabled};
              },
          );

  const updateLanEnabled$ = actions.pingConnectivityModes$
    .map(() => networkSource.wifiIsEnabled())
    .flatten()
    .map(
      (lanEnabled) =>
        function updateLanEnabled(prev: State): State {
          return {...prev, lanEnabled};
        },
    );

  const updateInternetEnabled$ = actions.pingConnectivityModes$
    .map(() => networkSource.hasInternetConnection())
    .flatten()
    .map(
      (internetEnabled) =>
        function updateInternetEnabled(prev: State): State {
          return {...prev, internetEnabled};
        },
    );

  const updateBluetoothLastScanned$ = ssbSource.bluetoothScanState$.map(
    (_scanState: string) =>
      function setBluetoothScanState(prev: State): State {
        return {...prev, bluetoothLastScanned: Date.now()};
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
    (stagedPeers) =>
      function setPeersReducer(prev: State): State {
        return {...prev, stagedPeers, timestampStagedPeers: Date.now()};
      },
  );

  const openConnMenuReducer$ = actions.openPeerInConnection$.map(
    (peer) =>
      function openConnMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type: 'conn',
            target: peer,
          },
        };
      },
  );

  const openStagingMenuReducer$ = actions.openStagedPeer$.map(
    (peer) =>
      function openStagingMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type:
              (peer[1].type as string) === 'room' ? 'staged-room' : 'staging',
            target: peer,
          },
        };
      },
  );

  const openRoomMenuReducer$ = actions.openRoom$.map(
    (peer) =>
      function openRoomMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type: 'room',
            target: peer,
          },
        };
      },
  );

  const closeMenuReducer$ = xs
    .merge(
      actions.closeItemMenu$,
      actions.goToPeerProfile$,
      actions.connectPeer$,
      actions.disconnectPeer$,
      actions.disconnectForgetPeer$,
      actions.forgetPeer$,
      actions.goToManageAliases$,
      actions.shareRoomInvite$,
      actions.signInRoom$,
    )
    .mapTo(function closeMenuReducer(prev: State): State {
      return {
        ...prev,
        itemMenu: {...prev.itemMenu, opened: false},
      };
    });

  return xs.merge(
    initReducer$,
    updateBluetoothEnabled$,
    updateLanEnabled$,
    updateInternetEnabled$,
    setPeersReducer$,
    updateBluetoothLastScanned$,
    setStagedPeersReducer$,
    openConnMenuReducer$,
    openStagingMenuReducer$,
    openRoomMenuReducer$,
    closeMenuReducer$,
  );
}
