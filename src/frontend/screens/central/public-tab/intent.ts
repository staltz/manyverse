/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {PressAddReactionEvent, PressReactionsEvent} from '../../../ssb/types';

export type ProfileNavEvent = {authorFeedId: FeedId};
export type ThreadNavEvent = {rootMsgId: MsgId; replyToMsgId?: MsgId};

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  fabPress$: Stream<string>,
) {
  return {
    goToCompose$: fabPress$.filter(action => action === 'compose'),

    goToAccounts$: (reactSource
      .select('publicFeed')
      .events('pressReactions') as Stream<PressReactionsEvent>).map(
      ({msgKey, reactions}) => ({
        title: 'Reactions',
        msgKey,
        accounts: reactions,
      }),
    ),

    addReactionMsg$: reactSource
      .select('publicFeed')
      .events('pressAddReaction') as Stream<PressAddReactionEvent>,

    goToProfile$: xs.merge(
      reactSource.select('publicFeed').events('pressAuthor'),
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
    ) as Stream<ThreadNavEvent>,
  };
}
