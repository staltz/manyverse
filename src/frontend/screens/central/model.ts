// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from '@cycle/state';
import {Animated} from 'react-native';
import {FeedId, MsgId} from 'ssb-typescript';
import {SSBSource} from '~frontend/drivers/ssb';
import progressCalculation, {
  State as ProgressState,
  INITIAL_STATE as INITIAL_PROGRESS_STATE,
} from '~frontend/components/progressCalculation';
import {State as TopBarState} from './top-bar';
import {State as PublicTabState} from './public-tab/model';
import {State as PrivateTabState} from './private-tab/model';
import {State as ActivityTabState} from './activity-tab/model';
import {State as ConnectionsTabState} from './connections-tab/model';

export interface State extends ProgressState {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  selfAvatarUrl?: string;
  currentTab: 'public' | 'private' | 'activity' | 'connections';
  scrollHeaderBy: Animated.Value;
  publicTab?: PublicTabState;
  privateTab?: PrivateTabState;
  activityTab?: ActivityTabState;
  connectionsTab?: ConnectionsTabState;
  initializedSSB: boolean;
  numOfPublicUpdates: number;
  numOfPrivateUpdates: number;
  numOfActivityUpdates: number;
  hasNewVersion: boolean;
  canPublishSSB: boolean;
  isDrawerOpen: boolean;
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
    const {selfFeedId, selfAvatarUrl, canPublishSSB} = parent;
    if (parent.publicTab) {
      return {
        ...parent.publicTab,
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        canPublishSSB,
      };
    } else {
      return {
        isVisible,
        selfFeedId,
        lastSessionTimestamp: parent.lastSessionTimestamp,
        preferredReactions: [],
        selfAvatarUrl,
        getPublicFeedReadable: null,
        numOfUpdates: parent.numOfPublicUpdates,
        initializedSSB: parent.initializedSSB,
        hasComposeDraft: false,
        canPublishSSB,
        scrollHeaderBy: parent.scrollHeaderBy,
      };
    }
  },

  set: (parent: State, child: PublicTabState): State => {
    return {
      ...parent,
      initializedSSB: child.initializedSSB,
      numOfPublicUpdates: child.numOfUpdates,
      lastSessionTimestamp: child.lastSessionTimestamp,
      publicTab: child,
    };
  },
};

export const privateTabLens: Lens<State, PrivateTabState> = {
  get: (parent: State): PrivateTabState => {
    const isVisible = parent.currentTab === 'private';
    const {selfFeedId, selfAvatarUrl} = parent;
    if (parent.privateTab) {
      return {...parent.privateTab, isVisible, selfFeedId, selfAvatarUrl};
    } else {
      return {
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        getPrivateFeedReadable: null,
        updates: new Set<MsgId>(),
        updatesFlag: false,
        conversationsOpen: new Map(),
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

export const activityTabLens: Lens<State, ActivityTabState> = {
  get: (parent: State): ActivityTabState => {
    const isVisible = parent.currentTab === 'activity';
    const {selfFeedId, selfAvatarUrl} = parent;
    if (parent.activityTab) {
      return {...parent.activityTab, isVisible, selfFeedId, selfAvatarUrl};
    } else {
      return {
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        lastSessionTimestamp: parent.lastSessionTimestamp,
        numOfUpdates: parent.numOfActivityUpdates,
        getActivityFeedReadable: null,
        getFirewallAttemptLiveReadable: null,
      };
    }
  },

  set: (parent: State, child: ActivityTabState): State => {
    return {
      ...parent,
      numOfActivityUpdates: child.numOfUpdates,
      activityTab: child,
    };
  },
};

export const connectionsTabLens: Lens<State, ConnectionsTabState> = {
  get: (parent: State): ConnectionsTabState => {
    const isVisible = parent.currentTab === 'connections';
    const {selfFeedId, selfAvatarUrl, initializedSSB} = parent;
    if (parent.connectionsTab) {
      return {
        ...parent.connectionsTab,
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        initializedSSB,
      };
    } else {
      return {
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        internetEnabled: false,
        lanEnabled: false,
        initializedSSB: parent.initializedSSB,
        postsCount: 0,
        peers: [],
        rooms: [],
        stagedPeers: [],
        status: 'bad',
        scenario: 'knows-no-one',
        bestRecommendation: null,
        otherRecommendations: '',
        timestampPeersAndRooms: 0,
        timestampStagedPeers: 0,
      };
    }
  },

  set: (parent: State, child: ConnectionsTabState): State => {
    return {
      ...parent,
      connectionsTab: child,
    };
  },
};

export interface Actions {
  changeTab$: Stream<State['currentTab']>;
  backToPublicTab$: Stream<null>;
  drawerToggled$: Stream<boolean>;
  hasNewVersion$: Stream<any>;
}

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) {
      return prev;
    } else {
      return {
        ...INITIAL_PROGRESS_STATE,
        selfFeedId: '',
        lastSessionTimestamp: Infinity,
        currentTab: 'public',
        numOfPublicUpdates: 0,
        numOfPrivateUpdates: 0,
        numOfActivityUpdates: 0,
        initializedSSB: false,
        hasNewVersion: false,
        scrollHeaderBy: new Animated.Value(0),
        isDrawerOpen: false,
        canPublishSSB: true,
      };
    }
  });

  const setSelfFeedId$ = ssbSource.selfFeedId$.map(
    (selfFeedId) =>
      function setSelfFeedId(prev: State): State {
        if (!selfFeedId) return {...prev, selfFeedId: ''};
        return {...prev, selfFeedId};
      },
  );

  const aboutReducer$ = ssbSource.selfFeedId$
    .map((selfFeedId) =>
      selfFeedId ? ssbSource.profileAbout$(selfFeedId) : xs.of(null),
    )
    .flatten()
    .map(
      (about) =>
        function aboutReducer(prev: State): State {
          if (!about) return {...prev, selfAvatarUrl: ''};
          return {...prev, selfAvatarUrl: about.imageUrl};
        },
    );

  const progressReducer$ = progressCalculation(ssbSource) as Stream<
    Reducer<State>
  >;

  const changeTabReducer$ = actions.changeTab$.map(
    (nextTab) =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: nextTab};
      },
  );

  const backToPublicTabReducer$ = actions.backToPublicTab$.map(
    () =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: 'public'};
      },
  );

  const isDrawerOpenReducer$ = actions.drawerToggled$.map(
    (isOpen) =>
      function isDrawerOpenReducer(prev: State): State {
        return {...prev, isDrawerOpen: isOpen};
      },
  );

  const hasNewVersionReducer$ = actions.hasNewVersion$.map(
    () =>
      function hasNewVersionReducer(prev: State): State {
        return {...prev, hasNewVersion: true};
      },
  );

  return xs.merge(
    initReducer$,
    setSelfFeedId$,
    aboutReducer$,
    changeTabReducer$,
    backToPublicTabReducer$,
    isDrawerOpenReducer$,
    progressReducer$,
    hasNewVersionReducer$,
  );
}
