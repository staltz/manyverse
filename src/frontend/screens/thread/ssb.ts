/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {toVoteContent, toReplyPostContent} from '../../ssb/utils/to-ssb';
import {State} from './model';
import {Req, contentToPublishReq} from '../../drivers/ssb';

export type SSBActions = {
  likeMsg$: Stream<{msgKey: string; like: boolean}>;
  publishMsg$: Stream<State>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(actions: SSBActions): Stream<Req> {
  const toggleLikeMsg$ = actions.likeMsg$.map(toVoteContent);

  const publishReply$ = actions.publishMsg$.map(state =>
    toReplyPostContent(state.replyText, state.rootMsgId as string),
  );

  return xs.merge(toggleLikeMsg$, publishReply$).map(contentToPublishReq);
}
