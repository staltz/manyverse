// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {
  CentralUpdateActivity,
  CentralUpdateConnections,
  CentralUpdatePrivate,
  CentralUpdatePublic,
  GlobalEvent,
} from '../../drivers/eventbus';
import {PeerKV, StagedPeerKV} from '../../ssb/types';
import progressCalculation, {
  State as ProgressState,
  INITIAL_STATE as INITIAL_PROGRESS_STATE,
} from '../../components/progressCalculation';

export interface State extends ProgressState {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  name?: string;
  currentTab: 'public' | 'private' | 'activity' | 'connections';
  connections?: {
    status: 'offline' | 'bad' | 'fair' | 'good';
    peers: Array<PeerKV>;
    rooms: Array<PeerKV>;
    stagedPeers: Array<StagedPeerKV>;
    initializedSSB: boolean;
  };
  numOfPublicUpdates: number;
  numOfPrivateUpdates: number;
  numOfActivityUpdates: number;
}

interface Actions {
  changeTab$: Stream<State['currentTab']>;
}

export default function model(
  actions: Actions,
  globalEventBus: Stream<GlobalEvent>,
  ssbSource: SSBSource,
) {
  const centralUpdatePublic$ = globalEventBus.filter(
    (ev) => ev.type === 'centralScreenUpdate' && ev.subtype === 'publicUpdates',
  ) as Stream<CentralUpdatePublic>;

  const centralUpdatePrivate$ = globalEventBus.filter(
    (ev) =>
      ev.type === 'centralScreenUpdate' && ev.subtype === 'privateUpdates',
  ) as Stream<CentralUpdatePrivate>;

  const centralUpdateActivity$ = globalEventBus.filter(
    (ev) =>
      ev.type === 'centralScreenUpdate' && ev.subtype === 'activityUpdates',
  ) as Stream<CentralUpdateActivity>;

  const centralUpdateConnections$ = globalEventBus.filter(
    (ev) => ev.type === 'centralScreenUpdate' && ev.subtype === 'connections',
  ) as Stream<CentralUpdateConnections>;

  const selfFeedId$ = ssbSource.selfFeedId$.take(1);

  const selfFeedIdReducer$ = selfFeedId$.map(
    (selfFeedId: FeedId) =>
      function selfFeedIdReducer(prev: State): State {
        if (!prev) {
          return {
            selfFeedId,
            currentTab: 'public',
            numOfPublicUpdates: 0,
            numOfPrivateUpdates: 0,
            numOfActivityUpdates: 0,
            ...INITIAL_PROGRESS_STATE,
          };
        } else {
          return {...prev, selfFeedId};
        }
      },
  );

  const aboutReducer$ = selfFeedId$
    .map((selfFeedId) => ssbSource.profileAboutLive$(selfFeedId))
    .flatten()
    .map(
      (about) =>
        function aboutReducer(prev: State): State {
          let name;
          if (!!about.name && about.name !== about.id) {
            name = about.name;
          }
          if (!prev) {
            return {
              selfFeedId: about.id,
              selfAvatarUrl: about.imageUrl,
              currentTab: 'public',
              numOfPublicUpdates: 0,
              numOfPrivateUpdates: 0,
              numOfActivityUpdates: 0,
              ...INITIAL_PROGRESS_STATE,
            };
          } else {
            return {
              ...prev,
              selfAvatarUrl: about.imageUrl,
              name,
            };
          }
        },
    );

  const changeTabReducer$ = actions.changeTab$.map(
    (nextTab) =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: nextTab};
      },
  );

  const updatePublicCounterReducer$ = centralUpdatePublic$.map(
    ({counter}) =>
      function updatePublicCounterReducer(prev: State): State {
        if (!prev) return prev;
        if (counter !== prev.numOfPublicUpdates) {
          return {...prev, numOfPublicUpdates: counter};
        } else {
          return prev;
        }
      },
  );

  const updatePrivateCounterReducer$ = centralUpdatePrivate$.map(
    ({counter}) =>
      function updatePrivateCounterReducer(prev: State): State {
        if (!prev) return prev;
        if (counter !== prev.numOfPrivateUpdates) {
          return {...prev, numOfPrivateUpdates: counter};
        } else {
          return prev;
        }
      },
  );

  const updateActivityCounterReducer$ = centralUpdateActivity$.map(
    ({counter}) =>
      function updateActivityCounterReducer(prev: State): State {
        if (!prev) return prev;
        if (counter !== prev.numOfActivityUpdates) {
          return {...prev, numOfActivityUpdates: counter};
        } else {
          return prev;
        }
      },
  );

  const updateConnectionsReducer$ = centralUpdateConnections$.map(
    (ev) =>
      function updateConnectionsReducer(prev: State): State {
        if (!prev) return prev;
        const prevConnections = prev.connections;
        const nextConnections = ev.substate;
        if (!prevConnections || nextConnections !== prevConnections) {
          return {
            ...prev,
            connections: nextConnections,
          };
        } else {
          return prev;
        }
      },
  );

  const progressReducer$ = progressCalculation(ssbSource) as Stream<
    Reducer<State>
  >;

  return xs.merge(
    selfFeedIdReducer$,
    aboutReducer$,
    changeTabReducer$,
    updatePublicCounterReducer$,
    updatePrivateCounterReducer$,
    updateActivityCounterReducer$,
    updateConnectionsReducer$,
    progressReducer$,
  );
}
