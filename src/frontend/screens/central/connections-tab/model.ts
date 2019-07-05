/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {
  SSBSource,
  PeerKV,
  StagedPeerKV,
  StagedPeerMetadata as StagedPeer,
} from '../../../drivers/ssb';
import {NetworkSource} from '../../../drivers/network';
import {noteStorageKeyFor} from './asyncstorage';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';

export type State = {
  selfFeedId: FeedId;
  bluetoothEnabled: boolean;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerKV>;
  stagedPeers: Array<StagedPeerKV>;
  isSyncing: boolean;
  isVisible: boolean;
  bluetoothLastScanned: number;
  itemMenu: {
    opened: boolean;
    type: 'conn' | 'invite' | 'staging';
    target?: any;
  };
  latestInviteMenuTarget: StagedPeer | null;
};

export type Actions = {
  pingConnectivityModes$: Stream<any>;
  openStagedPeer$: Stream<StagedPeerKV>;
  openPeerInConnection$: Stream<PeerKV>;
  closeItemMenu$: Stream<any>;
  goToPeerProfile$: Stream<any>;
  disconnectPeer$: Stream<any>;
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

  const updateBluetoothEnabled$ = actions.pingConnectivityModes$
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
    peers =>
      function setPeersReducer(prev: State): State {
        return {...prev, peers};
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
        return xs.of([stagedPeers, []]);
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

  const openInviteMenuReducer$ = actions.openStagedPeer$
    .filter(peer => peer[1].type === 'dht')
    .map(
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

  const openConnMenuReducer$ = actions.openPeerInConnection$.map(
    peer =>
      function openInviteMenuReducer(prev: State): State {
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

  const closeInviteMenuReducer$ = xs
    .merge(
      actions.closeItemMenu$,
      actions.goToPeerProfile$,
      actions.disconnectPeer$,
      actions.infoClientDhtInvite$,
      actions.infoServerDhtInvite$,
      actions.noteDhtInvite$,
      actions.shareDhtInvite$,
      actions.removeDhtInvite$,
    )
    .mapTo(function closeInviteMenuReducer(prev: State): State {
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
    openInviteMenuReducer$,
    openConnMenuReducer$,
    closeInviteMenuReducer$,
    addNoteFromDialogReducer$,
  );
}
