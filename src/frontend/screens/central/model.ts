/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from '@cycle/state';
import {Animated} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {State as PublicTabState} from './public-tab/model';
import {State as TopBarState} from './top-bar';
import {State as ConnectionsTabState} from './connections-tab/model';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  currentTab: 'public' | 'connections';
  scrollHeaderBy: Animated.Value;
  publicTab?: PublicTabState;
  connectionsTab?: ConnectionsTabState;
  numOfPublicUpdates: number;
  isSyncing: boolean;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    currentTab: 'public',
    isSyncing: false,
    numOfPublicUpdates: 0,
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
        itemMenu: {opened: false, type: 'conn'},
        latestInviteMenuTarget: null,
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
