/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Platform} from 'react-native';
import {SSBSource} from '../../../drivers/ssb';
import {
  PeerKV,
  StagedPeerKV,
  StagedPeerMetadata as StagedPeer,
} from '../../../../shared-types';
import {NetworkSource} from '../../../drivers/network';
import {noteStorageKeyFor} from './asyncstorage';

export type State = {
  selfFeedId: FeedId;
  bluetoothEnabled: boolean;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV>;
  stagedPeers: Array<StagedPeerKV>;
  isSyncing: boolean;
  isVisible: boolean;
  bluetoothLastScanned: number;
  itemMenu: {
    opened: boolean;
    type: 'conn' | 'invite' | 'staging' | 'room' | 'staged-room';
    target?: any;
  };
  latestInviteMenuTarget: StagedPeer | null;
};

export type Actions = {
  pingConnectivityModes$: Stream<any>;
  openPeerInConnection$: Stream<PeerKV>;
  openStagedPeer$: Stream<StagedPeerKV>;
  openRoom$: Stream<PeerKV>;
  openDHTStagedPeer$: Stream<StagedPeerKV>;
  connectPeer$: Stream<any>;
  followConnectPeer$: Stream<any>;
  disconnectPeer$: Stream<any>;
  disconnectForgetPeer$: Stream<any>;
  forgetPeer$: Stream<any>;
  shareRoomInvite$: Stream<any>;
  closeItemMenu$: Stream<any>;
  goToPeerProfile$: Stream<any>;
  infoClientDhtInvite$: Stream<any>;
  infoServerDhtInvite$: Stream<any>;
  noteDhtInvite$: Stream<any>;
  shareDhtInvite$: Stream<any>;
  removeDhtInvite$: Stream<any>;
  addNoteFromDialog$: Stream<string>;
};

export default function model(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
  networkSource: NetworkSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {
      selfFeedId: '',
      bluetoothEnabled: false,
      lanEnabled: false,
      internetEnabled: false,
      isSyncing: false,
      isVisible: false,
      bluetoothLastScanned: 0,
      peers: [],
      rooms: [],
      stagedPeers: [],
      itemMenu: {opened: false, type: 'conn'},
      latestInviteMenuTarget: null,
    };
  });

  const updateIsSyncing$ = ssbSource.isSyncing$.map(
    isSyncing =>
      function updateIsSyncing(prev: State): State {
        return {...prev, isSyncing};
      },
  );

  const updateBluetoothEnabled$ =
    Platform.OS === 'ios'
      ? xs.empty()
      : actions.pingConnectivityModes$
          .map(() => networkSource.bluetoothIsEnabled())
          .flatten()
          .map(
            bluetoothEnabled =>
              function updateBluetoothEnabled(prev: State): State {
                return {...prev, bluetoothEnabled};
              },
          );

  const updateLanEnabled$ = actions.pingConnectivityModes$
    .map(() => networkSource.wifiIsEnabled())
    .flatten()
    .map(
      lanEnabled =>
        function updateLanEnabled(prev: State): State {
          return {...prev, lanEnabled};
        },
    );

  const updateInternetEnabled$ = actions.pingConnectivityModes$
    .map(() => networkSource.hasInternetConnection())
    .flatten()
    .map(
      internetEnabled =>
        function updateInternetEnabled(prev: State): State {
          return {...prev, internetEnabled};
        },
    );

  const setPeersReducer$ = ssbSource.peers$.map(
    allPeers =>
      function setPeersReducer(prev: State): State {
        const peers = allPeers.filter(
          ([, data]) => (data.type as any) !== 'room',
        );
        const rooms = allPeers.filter(
          ([, data]) => (data.type as any) === 'room',
        );
        return {...prev, peers, rooms};
      },
  );

  const updateBluetoothLastScanned$ = ssbSource.bluetoothScanState$.map(
    (_scanState: string) =>
      function setBluetoothScanState(prev: State): State {
        return {...prev, bluetoothLastScanned: Date.now()};
      },
  );

  const setStagedPeersReducer$ = ssbSource.stagedPeers$
    .map(stagedPeers => {
      const dhtInvites = stagedPeers
        .filter(([_address, data]) => data.type === 'dht')
        .map(noteStorageKeyFor);

      if (dhtInvites.length === 0) {
        const notes: Array<[string, string]> = [];
        return xs.of([stagedPeers, notes]);
      } else {
        return asyncStorageSource
          .multiGet(dhtInvites)
          .map(keyValuePairs => [stagedPeers, keyValuePairs]);
      }
    })
    .flatten()
    .map(
      ([rawStagedPeers, notes]: [StagedPeerKV[], [string, string][]]) =>
        function setPeersReducer(prev: State): State {
          const stagedPeers: Array<StagedPeerKV> = rawStagedPeers.map(peer => {
            const key = peer[1].key;
            const noteKV = notes.find(([k, v]) => k.endsWith(key) && !!v);
            if (!noteKV) return peer;
            return [peer[0], {...peer[1], note: noteKV[1]}] as StagedPeerKV;
          });
          return {...prev, stagedPeers};
        },
    );

  const openConnMenuReducer$ = actions.openPeerInConnection$.map(
    peer =>
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
    peer =>
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
    peer =>
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

  const openInviteMenuReducer$ = actions.openDHTStagedPeer$.map(
    peer =>
      function openInviteMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type: 'invite',
            target: peer[1],
          },
          latestInviteMenuTarget: peer[1],
        };
      },
  );

  const closeMenuReducer$ = xs
    .merge(
      actions.closeItemMenu$,
      actions.goToPeerProfile$,
      actions.connectPeer$,
      actions.followConnectPeer$,
      actions.disconnectPeer$,
      actions.disconnectForgetPeer$,
      actions.forgetPeer$,
      actions.shareRoomInvite$,
      actions.infoClientDhtInvite$,
      actions.infoServerDhtInvite$,
      actions.noteDhtInvite$,
      actions.shareDhtInvite$,
      actions.removeDhtInvite$,
    )
    .mapTo(function closeMenuReducer(prev: State): State {
      return {
        ...prev,
        itemMenu: {...prev.itemMenu, opened: false},
      };
    });

  const addNoteFromDialogReducer$ = actions.addNoteFromDialog$.map(
    note =>
      function addNoteFromDialogReducer(prev: State): State {
        if (!prev.latestInviteMenuTarget) return prev;
        const stagedPeers: Array<StagedPeerKV> = prev.stagedPeers.map(kv => {
          const [addr, peer] = kv;
          return peer.key === (prev.latestInviteMenuTarget as StagedPeer).key
            ? ([addr, {...peer, note}] as StagedPeerKV)
            : kv;
        });
        return {...prev, stagedPeers};
      },
  );

  return xs.merge(
    initReducer$,
    updateIsSyncing$,
    updateBluetoothEnabled$,
    updateLanEnabled$,
    updateInternetEnabled$,
    setPeersReducer$,
    updateBluetoothLastScanned$,
    setStagedPeersReducer$,
    openConnMenuReducer$,
    openStagingMenuReducer$,
    openRoomMenuReducer$,
    openInviteMenuReducer$,
    closeMenuReducer$,
    addNoteFromDialogReducer$,
  );
}
