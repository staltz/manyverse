/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {MsgId, FeedId, Msg} from 'ssb-typescript';
import {ReactSource} from '@cycle/react';

export type ProfileNavEvent = {authorFeedId: FeedId};

export default function intent(reactSource: ReactSource) {
  return {
    goToCompose$: reactSource.select('fab').events('pressItem'),

    goToEdit$: reactSource.select('editProfile').events('press') as Stream<
      null
    >,

    goToProfile$: reactSource.select('feed').events('pressAuthor') as Stream<
      ProfileNavEvent
    >,

    openMessageEtc$: reactSource.select('feed').events('pressEtc') as Stream<
      Msg
    >,

    goToThread$: xs.merge(
      reactSource.select('feed').events('pressExpandThread'),
      reactSource
        .select('feed')
        .events('pressReply')
        .map(({rootKey, msgKey}) => ({
          rootMsgId: rootKey,
          replyToMsgId: msgKey,
        })),
    ) as Stream<{rootMsgId: MsgId; replyToMsgId?: MsgId}>,

    likeMsg$: reactSource.select('feed').events('pressLike') as Stream<{
      msgKey: string;
      like: boolean;
    }>,

    follow$: reactSource.select('follow').events('press') as Stream<boolean>,
  };
}
