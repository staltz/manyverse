// SPDX-FileCopyrightText: 2019-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {toReplyPostContent, toPostContent} from '../../ssb/utils/to-ssb';
import {State} from './model';
import {Req, contentToPublishReq} from '../../drivers/ssb';
import {PostContent} from 'ssb-typescript';
import {MAX_PRIVATE_MESSAGE_RECIPIENTS} from '../../ssb/utils/constants';

export type SSBActions = {
  publishMsg$: Stream<string>;
};

function createReplyContent(text: string, state: State): PostContent {
  const messages = state.thread.messages;
  const branch = messages[messages.length - 1].key;
  const content = toReplyPostContent({text, root: state.rootMsgId!, branch});
  content.recps = state.thread.recps.map((recp) => recp.id);
  return content;
}

function createRootContent(text: string, state: State): PostContent {
  if (state.thread.recps.length === 0) {
    throw new Error('Cannot publish new conversation without recipients');
  }
  if (state.thread.recps.length > MAX_PRIVATE_MESSAGE_RECIPIENTS) {
    throw new Error(
      'Cannot publish conversation with more than ' +
        MAX_PRIVATE_MESSAGE_RECIPIENTS +
        ' recipients',
    );
  }
  const content = toPostContent(text);
  content.recps = state.thread.recps.map((recp) => recp.id);
  if (!content.recps.includes(state.selfFeedId)) {
    content.recps.push(state.selfFeedId);
  }
  return content;
}

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  state$: Stream<State>,
): Stream<Req> {
  return actions.publishMsg$
    .compose(sampleCombine(state$))
    .map(([text, state]) => {
      if (state.rootMsgId) {
        return createReplyContent(text, state);
      } else {
        return createRootContent(text, state);
      }
    })
    .map(contentToPublishReq);
}
