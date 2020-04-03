/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {toVoteContent, toReplyPostContent} from '../../ssb/utils/to-ssb';
import {State} from './model';
import {Req, contentToPublishReq} from '../../drivers/ssb';
import {PressAddReactionEvent} from '../../ssb/types';

export type SSBActions = {
  addReactionMsg$: Stream<PressAddReactionEvent>;
  publishMsg$: Stream<State>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(actions: SSBActions): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$.map(toVoteContent);

  const publishReply$ = actions.publishMsg$.map(state => {
    const messages = state.thread.messages;
    return toReplyPostContent(
      state.replyText,
      state.rootMsgId as string,
      messages[messages.length - 1].key,
      void 0, // no content warning
    );
  });

  return xs.merge(addReaction$, publishReply$).map(contentToPublishReq);
}
