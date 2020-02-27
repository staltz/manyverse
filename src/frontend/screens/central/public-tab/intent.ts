/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';
import {
  GlobalEvent,
  TriggerFeedCypherlink,
  TriggerMsgCypherlink,
} from '../../../drivers/eventbus';
import {Screens} from '../../..';
import {Likes} from '../../../ssb/types';

export type LikeEvent = {msgKey: string; like: boolean};
export type ProfileNavEvent = {authorFeedId: FeedId};
export type ThreadNavEvent = {rootMsgId: MsgId; replyToMsgId?: MsgId};

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  globalEventBus: Stream<GlobalEvent>,
  fabPress$: Stream<string>,
) {
  return {
    goToCompose$: fabPress$.filter(action => action === 'compose'),

    goToAccounts$: (reactSource
      .select('publicFeed')
      .events('pressLikeCount') as Stream<{
      msgKey: MsgId;
      likes: Likes;
    }>).map(({msgKey, likes}) => ({title: 'Likes', msgKey, ids: likes})),

    likeMsg$: reactSource.select('publicFeed').events('pressLike') as Stream<
      LikeEvent
    >,

    goToProfile$: xs.merge(
      reactSource.select('publicFeed').events('pressAuthor'),
      // TODO: move this out of here. it's currently handling
      // cypherlink clicks from ANY screen, not just central>public-tab
      globalEventBus
        .filter(ev => ev.type === 'triggerFeedCypherlink')
        .map(ev => ({authorFeedId: (ev as TriggerFeedCypherlink).feedId})),
    ) as Stream<ProfileNavEvent>,

    openMessageEtc$: reactSource
      .select('publicFeed')
      .events('pressEtc') as Stream<Msg>,

    initializationDone$: reactSource
      .select('publicFeed')
      .events('initialPullDone') as Stream<void>,

    resetUpdates$: reactSource.select('publicFeed').events('refresh') as Stream<
      any
    >,

    refreshComposeDraft$: navSource
      .globalDidDisappear(Screens.Compose)
      .startWith(null as any) as Stream<any>,

    goToThread$: xs.merge(
      reactSource.select('publicFeed').events('goToThread'),
      reactSource
        .select('publicFeed')
        .events('pressReply')
        .map(({rootKey, msgKey}) => ({
          rootMsgId: rootKey,
          replyToMsgId: msgKey,
        })),
      // TODO: move this out of here. it's currently handling
      // cypherlink clicks from ANY screen, not just central>public-tab
      globalEventBus
        .filter(ev => ev.type === 'triggerMsgCypherlink')
        .map(ev => ({rootMsgId: (ev as TriggerMsgCypherlink).msgId})),
    ) as Stream<ThreadNavEvent>,
  };
}
