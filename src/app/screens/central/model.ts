/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from '@cycle/state';
import {FeedId} from 'ssb-typescript';
import {State as PublicTabState} from './public-tab/model';
import {State as TopBarState} from './top-bar';
import {State as ConnectionsTabState} from './connections-tab/model';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  currentTab: number;
  publicTab?: PublicTabState;
  connectionsTab?: ConnectionsTabState;
  numOfPublicUpdates: number;
  isSyncing: boolean;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    currentTab: 0,
    isSyncing: false,
    numOfPublicUpdates: 0,
  };
}

export const topBarLens: Lens<State, TopBarState> = {
  get: (parent: State): TopBarState => {
    if (parent.currentTab === 0) return {currentTab: 'public'};
    if (parent.currentTab === 1) return {currentTab: 'connections'};
    else return {currentTab: 'public'};
  },

  // Ignore writes from the child
  set: (parent: State, child: TopBarState): State => {
    return parent;
  },
};

export const publicTabLens: Lens<State, PublicTabState> = {
  get: (parent: State): PublicTabState => {
    if (parent.publicTab) {
      return {...parent.publicTab, selfFeedId: parent.selfFeedId};
    } else {
      return {
        selfFeedId: parent.selfFeedId,
        getPublicFeedReadable: null,
        getSelfRootsReadable: null,
        numOfUpdates: parent.numOfPublicUpdates,
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
    if (parent.connectionsTab) {
      const isVisible = parent.currentTab === 1;
      const selfFeedId = parent.selfFeedId;
      return {...parent.connectionsTab, selfFeedId, isVisible};
    } else {
      return {
        selfFeedId: parent.selfFeedId,
        lanEnabled: false,
        internetEnabled: false,
        isSyncing: parent.isSyncing,
        isVisible: parent.currentTab === 1,
        peers: [],
        stagedPeers: [],
        inviteMenuTarget: null,
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
  changeTab$: Stream<number>;
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
        currentTab: 0,
        isSyncing: false,
        numOfPublicUpdates: 0,
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
    i =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: i};
      },
  );

  return xs.merge(initReducer$, setSelfFeedId$, changeTabReducer$);
}
