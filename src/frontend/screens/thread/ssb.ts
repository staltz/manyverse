// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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

  const publishReply$ = actions.publishMsg$
    .filter(
      ({replyText}) =>
        typeof replyText === 'string' && replyText.trim().length > 0,
    )
    .map((state) => {
      const messages = state.thread.messages;
      return toReplyPostContent({
        text: state.replyText,
        root: state.rootMsgId,
        fork: state.higherRootMsgId,
        branch: messages[messages.length - 1].key,
      });
    });

  return xs.merge(addReaction$, publishReply$).map(contentToPublishReq);
}
