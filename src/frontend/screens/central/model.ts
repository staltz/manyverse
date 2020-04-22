/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from '@cycle/state';
import {Animated} from 'react-native';
import {FeedId, MsgId} from 'ssb-typescript';
import {State as TopBarState} from './top-bar';
import {State as PublicTabState} from './public-tab/model';
import {State as PrivateTabState} from './private-tab/model';
import {State as ConnectionsTabState} from './connections-tab/model';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  currentTab: 'public' | 'private' | 'connections';
  scrollHeaderBy: Animated.Value;
  publicTab?: PublicTabState;
  privateTab?: PrivateTabState;
  connectionsTab?: ConnectionsTabState;
  numOfPublicUpdates: number;
  numOfPrivateUpdates: number;
  isSyncing: boolean;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    currentTab: 'public',
    isSyncing: false,
    numOfPublicUpdates: 0,
    numOfPrivateUpdates: 0,
    scrollHeaderBy: new Animated.Value(0),
  };
}

/**
 * Identity lens
 */
export const topBarLens: Lens<State, TopBarState> = {
  get: (parent: State): TopBarState => {
    return parent;
  },

  set: (parent: State, child: TopBarState): State => {
    return parent;
  },
};

export const publicTabLens: Lens<State, PublicTabState> = {
  get: (parent: State): PublicTabState => {
    const isVisible = parent.currentTab === 'public';
    if (parent.publicTab) {
      return {...parent.publicTab, isVisible, selfFeedId: parent.selfFeedId};
    } else {
      return {
        selfFeedId: parent.selfFeedId,
        getPublicFeedReadable: null,
        getSelfRootsReadable: null,
        numOfUpdates: parent.numOfPublicUpdates,
        hasComposeDraft: false,
        isVisible,
        scrollHeaderBy: parent.scrollHeaderBy,
      };
    }
  },

  set: (parent: State, child: PublicTabState): State => {
    return {
      ...parent,
      numOfPublicUpdates: child.numOfUpdates,
      publicTab: child,
    };
  },
};

export const privateTabLens: Lens<State, PrivateTabState> = {
  get: (parent: State): PrivateTabState => {
    const isVisible = parent.currentTab === 'private';
    if (parent.privateTab) {
      return {...parent.privateTab, isVisible, selfFeedId: parent.selfFeedId};
    } else {
      return {
        isVisible,
        selfFeedId: parent.selfFeedId,
        getPrivateFeedReadable: null,
        updates: new Set<MsgId>(),
        updatesFlag: false,
        conversationOpen: null,
      };
    }
  },

  set: (parent: State, child: PrivateTabState): State => {
    return {
      ...parent,
      numOfPrivateUpdates: child.updates.size,
      privateTab: child,
    };
  },
};

export const connectionsTabLens: Lens<State, ConnectionsTabState> = {
  get: (parent: State): ConnectionsTabState => {
    const isVisible = parent.currentTab === 'connections';
    if (parent.connectionsTab) {
      const selfFeedId = parent.selfFeedId;
      return {...parent.connectionsTab, selfFeedId, isVisible};
    } else {
      return {
        selfFeedId: parent.selfFeedId,
        bluetoothEnabled: false,
        lanEnabled: false,
        internetEnabled: false,
        isSyncing: parent.isSyncing,
        isVisible,
        bluetoothLastScanned: 0,
        peers: [],
        rooms: [],
        stagedPeers: [],
        timestampPeersAndRooms: 0,
        timestampStagedPeers: 0,
        itemMenu: {opened: false, type: 'conn'},
        latestInviteMenuTarget: void 0,
      };
    }
  },

  set: (parent: State, child: ConnectionsTabState): State => {
    return {
      ...parent,
      isSyncing: child.isSyncing,
      connectionsTab: child,
    };
  },
};

export type Actions = {
  changeTab$: Stream<State['currentTab']>;
};

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) {
      return prev;
    } else {
      return {
        selfFeedId: '',
        currentTab: 'public',
        isSyncing: false,
        numOfPublicUpdates: 0,
        numOfPrivateUpdates: 0,
        scrollHeaderBy: new Animated.Value(0),
      };
    }
  });

  const setSelfFeedId$ = ssbSource.selfFeedId$.map(
    selfFeedId =>
      function setSelfFeedId(prev: State): State {
        return {...prev, selfFeedId};
      },
  );

  const changeTabReducer$ = actions.changeTab$.map(
    nextTab =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: nextTab};
      },
  );

  return xs.merge(initReducer$, setSelfFeedId$, changeTabReducer$);
}
