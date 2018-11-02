/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {PeerMetadata, FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {SSBSource, StagedPeerMetadata} from '../../../drivers/ssb';
import {NetworkSource} from '../../../drivers/network';
import {noteStorageKeyFor} from './asyncstorage';
import dropRepeats from 'xstream/extra/dropRepeats';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';

export type StagedPeer = StagedPeerMetadata & {
  note?: string;
};

export type State = {
  selfFeedId: FeedId;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerMetadata>;
  stagedPeers: Array<StagedPeer>;
  isSyncing: boolean;
  isVisible: boolean;
  inviteMenuTarget: StagedPeer | null;
  latestInviteMenuTarget: StagedPeer | null;
};

export type Actions = {
  openStagedPeer$: Stream<StagedPeer>;
  closeInviteMenu$: Stream<any>;
  infoClientDhtInvite$: Stream<any>;
  infoServerDhtInvite$: Stream<any>;
  noteDhtInvite$: Stream<any>;
  shareDhtInvite$: Stream<any>;
  removeDhtInvite$: Stream<any>;
  addNoteFromDialog$: Stream<string>;
};

export default function model(
  state$: Stream<State>,
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
  networkSource: NetworkSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {
      selfFeedId: '',
      lanEnabled: false,
      internetEnabled: false,
      isSyncing: false,
      isVisible: false,
      peers: [],
      stagedPeers: [],
      inviteMenuTarget: null,
      latestInviteMenuTarget: null,
    };
  });

  const updateIsSyncing$ = ssbSource.isSyncing$.map(
    isSyncing =>
      function updateIsSyncing(prev: State): State {
        return {...prev, isSyncing};
      },
  );

  const updateLanEnabled$ = xs
    .periodic(4000)
    .map(() => networkSource.wifiIsEnabled())
    .flatten()
    .map(
      lanEnabled =>
        function updateLanEnabled(prev: State): State {
          return {...prev, lanEnabled};
        },
    );

  const shouldUpdateInternetEnabled$ = state$
    .map(state => state.isVisible)
    .compose(dropRepeats())
    .map(
      isTabVisible =>
        isTabVisible
          ? concat(xs.of(0), xs.periodic(1000).take(2), xs.periodic(4000))
          : xs.never(),
    )
    .flatten()
    .startWith(null);

  const updateInternetEnabled$ = shouldUpdateInternetEnabled$
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

  const setStagedPeersReducer$ = ssbSource.stagedPeers$
    .map(stagedPeers => {
      const dhtInvites = stagedPeers
        .filter(p => p.source === 'dht')
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
      ([rawStagedPeers, notes]: [StagedPeerMetadata[], [string, string][]]) =>
        function setPeersReducer(prev: State): State {
          const stagedPeers = rawStagedPeers.map(p => {
            const kv = notes.find(_kv => _kv[0].endsWith(p.key) && !!_kv[1]);
            if (!kv) return p;
            return {...p, note: kv[1]};
          });
          return {...prev, stagedPeers};
        },
    );

  const openInviteMenuReducer$ = actions.openStagedPeer$
    .filter(peer => peer.source === 'dht')
    .map(
      peer =>
        function openInviteMenuReducer(prev: State): State {
          return {
            ...prev,
            inviteMenuTarget: peer,
            latestInviteMenuTarget: peer,
          };
        },
    );

  const closeInviteMenuReducer$ = xs
    .merge(
      actions.closeInviteMenu$,
      actions.infoClientDhtInvite$,
      actions.infoServerDhtInvite$,
      actions.noteDhtInvite$,
      actions.shareDhtInvite$,
      actions.removeDhtInvite$,
    )
    .mapTo(function openInviteMenuReducer(prev: State): State {
      return {...prev, inviteMenuTarget: null};
    });

  const addNoteFromDialogReducer$ = actions.addNoteFromDialog$.map(
    note =>
      function addNoteFromDialogReducer(prev: State): State {
        if (!prev.latestInviteMenuTarget) return prev;
        const stagedPeers = prev.stagedPeers.map(
          p =>
            p.key === (prev.latestInviteMenuTarget as StagedPeer).key
              ? {...p, note}
              : p,
        );
        return {...prev, stagedPeers};
      },
  );

  return xs.merge(
    initReducer$,
    updateIsSyncing$,
    updateLanEnabled$,
    updateInternetEnabled$,
    setPeersReducer$,
    setStagedPeersReducer$,
    openInviteMenuReducer$,
    closeInviteMenuReducer$,
    addNoteFromDialogReducer$,
  );
}
