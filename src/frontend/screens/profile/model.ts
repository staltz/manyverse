// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import concat from 'xstream/extra/concat';
import sample from 'xstream-sample';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId} from 'ssb-typescript';
import {
  AboutAndExtras,
  Alias,
  SSBFriendsQueryDetails,
} from '~frontend/ssb/types';
import {SSBSource, GetReadable} from '~frontend/drivers/ssb';
import {Props} from './props';

export interface State {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  selfAvatarUrl?: string;
  reason?: 'connection-attempt';
  displayFeedId: FeedId;
  about: AboutAndExtras;
  aliases: Array<Alias>;
  following: Array<FeedId> | null;
  followers: Array<FeedId> | null;
  friendsInCommon: Array<FeedId> | null;
  followsYou: SSBFriendsQueryDetails | null;
  youFollow: SSBFriendsQueryDetails | null;
  youBlock: SSBFriendsQueryDetails | null;
  connection: 'connected' | 'connecting' | 'disconnecting' | undefined;
  // TODO: use `ThreadSummaryWithExtras` but somehow support reply summaries
  getFeedReadable: GetReadable<any> | null;
  storageUsed: number | null;
}

interface Actions {
  refreshFeed$: Stream<any>;
  follow$: Stream<boolean>;
  blockContact$: Stream<null>;
  blockSecretlyContact$: Stream<null>;
  unblockContact$: Stream<null>;
  unblockSecretlyContact$: Stream<null>;
}

function dropCompletion<T>(stream: Stream<T>): Stream<T> {
  return xs.merge(stream, xs.never());
}

export default function model(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  props$: Stream<Props>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          selfFeedId: props.selfFeedId,
          selfAvatarUrl: props.selfAvatarUrl,
          displayFeedId: props.feedId,
          reason: props.reason,
          lastSessionTimestamp: Infinity,
          preferredReactions: [],
          getFeedReadable: null,
          about: {
            name: '',
            description: '',
            id: props.feedId,
          },
          aliases: [],
          following: null,
          followers: null,
          friendsInCommon: null,
          followsYou: null,
          youFollow: null,
          youBlock: null,
          connection: void 0,
          storageUsed: null,
        };
      },
  );

  const about$ = props$
    .map((props) => ssbSource.profileAboutLive$(props.feedId))
    .flatten();

  const updateAboutReducer$ = about$.map(
    (about) =>
      function updateAboutReducer(prev: State): State {
        return {...prev, about};
      },
  );

  const feedPair$ = props$
    .filter((props) => props.feedId !== props.selfFeedId)
    .map(({feedId, selfFeedId}) => ({feedId, selfFeedId}))
    .take(1)
    .compose(dropCompletion)
    .remember();

  const refreshRelationship$ = xs
    .merge(
      actions.follow$,
      actions.blockContact$,
      actions.blockSecretlyContact$,
      actions.unblockContact$,
      actions.unblockSecretlyContact$,
    )
    .compose(delay(500))
    .compose(sample(feedPair$));

  const updateFollowsYouReducer$ = feedPair$
    .map((pair) => ssbSource.isFollowing$(pair.feedId, pair.selfFeedId))
    .flatten()
    .map(
      (followsYou) =>
        function updateFollowsYouReducer(prev: State): State {
          return {...prev, followsYou};
        },
    );

  const updateYouFollowReducer$ = xs
    .merge(feedPair$, refreshRelationship$)
    .map((pair) => ssbSource.isFollowing$(pair.selfFeedId, pair.feedId))
    .flatten()
    .map(
      (youFollow) =>
        function updateRelationshipReducer(prev: State): State {
          return {...prev, youFollow};
        },
    );

  const updateYouBlockReducer$ = xs
    .merge(feedPair$, refreshRelationship$)
    .map((pair) => ssbSource.isBlocking$(pair.selfFeedId, pair.feedId))
    .flatten()
    .map(
      (youBlock) =>
        function updateRelationshipReducer(prev: State): State {
          return {...prev, youBlock};
        },
    );

  const updatePreferredReactionsReducer$ = ssbSource.preferredReactions$.map(
    (preferredReactions) =>
      function updatePreferredReactionsReducer(prev: State): State {
        return {...prev, preferredReactions};
      },
  );

  const updateConnectionReducer$ = ssbSource.peers$.map(
    (peers) =>
      function updateConnectionReducer(prev: State): State {
        const peer = peers.find((p) => p[1].key === prev.about.id);
        if (!peer) return prev;
        const connection = peer[1].state;
        if (connection === prev.connection) return prev;
        return {...prev, connection};
      },
  );

  const getFeedReadable$ = props$
    .map((props) => ssbSource.profileFeed$(props.feedId))
    .flatten();

  const loadLastSessionTimestampReducer$ = actions.refreshFeed$
    .startWith(null)
    .map(() =>
      asyncStorageSource.getItem('lastSessionTimestamp').map(
        (resultStr) =>
          function lastSessionTimestampReducer(prev: State): State {
            const lastSessionTimestamp = parseInt(resultStr ?? '', 10);
            if (isNaN(lastSessionTimestamp)) {
              return prev;
            } else {
              return {...prev, lastSessionTimestamp};
            }
          },
      ),
    )
    .flatten();

  const updateFollowingReducer$ = props$
    .map((props) => ssbSource.profileEdges$(props.feedId, false, true))
    .take(1)
    .flatten()
    .map(
      (following) =>
        function updateFollowingReducer(prev: State): State {
          return {...prev, following};
        },
    );

  const updateFollowersReducer$ = props$
    .map((props) => ssbSource.profileEdges$(props.feedId, true, true))
    .take(1)
    .flatten()
    .map(
      (followers) =>
        function updateFollowersReducer(prev: State): State {
          return {...prev, followers};
        },
    );

  const updateFriendsInCommonReducer$ = props$
    .map((props) => ssbSource.getFriendsInCommon$(props.feedId))
    .take(1)
    .flatten()
    .map(
      (friendsInCommon) =>
        function updateIntersectionReducer(prev: State): State {
          return {...prev, friendsInCommon};
        },
    );

  const updateAliasesReducer$ = props$
    .map((props) => ssbSource.getAliasesLive$(props.feedId))
    .flatten()
    .map(
      (aliases) =>
        function updateAliasesReducer(prev: State): State {
          return {...prev, aliases};
        },
    );

  const updateFeedStreamReducer$ = getFeedReadable$.map(
    (getFeedReadable) =>
      function updateFeedStreamReducer(prev: State): State {
        return {...prev, getFeedReadable};
      },
  );

  const updateStorageUsedReducer$ = props$
    .map((props) => ssbSource.bytesUsedByFeed$(props.feedId))
    .flatten()
    .map(
      (bytes) =>
        function updateStorageUsedReducer(prev: State): State {
          return {...prev, storageUsed: bytes};
        },
    );

  return concat(
    propsReducer$,
    xs.merge(
      loadLastSessionTimestampReducer$,
      updateAboutReducer$,
      updateFollowsYouReducer$,
      updateYouFollowReducer$,
      updateYouBlockReducer$,
      updatePreferredReactionsReducer$,
      updateConnectionReducer$,
      updateFollowingReducer$,
      updateFollowersReducer$,
      updateFriendsInCommonReducer$,
      updateAliasesReducer$,
      updateFeedStreamReducer$,
      updateStorageUsedReducer$,
    ),
  );
}
