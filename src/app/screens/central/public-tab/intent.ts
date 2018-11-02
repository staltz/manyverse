/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';

export type LikeEvent = {msgKey: string; like: boolean};
export type ProfileNavEvent = {authorFeedId: FeedId};
export type ThreadNavEvent = {rootMsgId: MsgId; replyToMsgId?: MsgId};

export default function intent(
  reactSource: ReactSource,
  fabPress$: Stream<string>,
) {
  return {
    goToCompose$: fabPress$.filter(action => action === 'compose'),

    likeMsg$: reactSource.select('publicFeed').events('pressLike') as Stream<
      LikeEvent
    >,

    goToProfile$: reactSource
      .select('publicFeed')
      .events('pressAuthor') as Stream<ProfileNavEvent>,

    openMessageEtc$: reactSource
      .select('publicFeed')
      .events('pressEtc') as Stream<Msg>,

    resetUpdates$: reactSource.select('publicFeed').events('refresh') as Stream<
      any
    >,

    goToThread$: xs.merge(
      reactSource.select('publicFeed').events('pressExpandThread'),
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
