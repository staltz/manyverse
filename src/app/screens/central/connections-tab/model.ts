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
import dropRepeats from 'xstream/extra/dropRepeats';

export type State = {
  selfFeedId: FeedId;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerMetadata>;
  stagedPeers: Array<StagedPeerMetadata>;
  isSyncing: boolean;
  isVisible: boolean;
};

export default function model(
  state$: Stream<State>,
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
    };
  });

  const updateIsSyncing$ = ssbSource.isSyncing$.map(
    isSyncing =>
      function updateIsSyncing(prev: State): State {
        return {
          selfFeedId: prev.selfFeedId,
          lanEnabled: prev.lanEnabled,
          internetEnabled: prev.internetEnabled,
          isSyncing,
          isVisible: prev.isVisible,
          peers: prev.peers,
          stagedPeers: prev.stagedPeers,
        };
      },
  );

  const updateLanEnabled$ = xs
    .periodic(4000)
    .map(() => networkSource.wifiIsEnabled())
    .flatten()
    .map(
      lanEnabled =>
        function updateLanEnabled(prev: State): State {
          return {
            selfFeedId: prev.selfFeedId,
            lanEnabled,
            internetEnabled: prev.internetEnabled,
            isSyncing: prev.isSyncing,
            isVisible: prev.isVisible,
            peers: prev.peers,
            stagedPeers: prev.stagedPeers,
          };
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
          return {
            selfFeedId: prev.selfFeedId,
            lanEnabled: prev.lanEnabled,
            internetEnabled,
            isSyncing: prev.isSyncing,
            isVisible: prev.isVisible,
            peers: prev.peers,
            stagedPeers: prev.stagedPeers,
          };
        },
    );

  const setPeersReducer$ = ssbSource.peers$.map(
    peers =>
      function setPeersReducer(prev: State): State {
        return {
          selfFeedId: prev.selfFeedId,
          lanEnabled: prev.lanEnabled,
          internetEnabled: prev.internetEnabled,
          isSyncing: prev.isSyncing,
          isVisible: prev.isVisible,
          peers,
          stagedPeers: prev.stagedPeers,
        };
      },
  );

  const setStagedPeersReducer$ = ssbSource.stagedPeers$.map(
    stagedPeers =>
      function setPeersReducer(prev: State): State {
        return {
          selfFeedId: prev.selfFeedId,
          lanEnabled: prev.lanEnabled,
          internetEnabled: prev.internetEnabled,
          isSyncing: prev.isSyncing,
          isVisible: prev.isVisible,
          peers: prev.peers,
          stagedPeers,
        };
      },
  );

  return xs.merge(
    initReducer$,
    updateIsSyncing$,
    updateLanEnabled$,
    updateInternetEnabled$,
    setPeersReducer$,
    setStagedPeersReducer$,
  );
}
