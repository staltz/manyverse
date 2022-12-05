// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Req, contentToPublishReq} from '~frontend/drivers/ssb';
import {
  toChannelSubscribeContent,
  toVoteContent,
} from '~frontend/ssb/utils/to-ssb';
import {PressAddReactionEvent} from '~frontend/ssb/types';
import {State} from './model';
import sampleCombine from 'xstream/extra/sampleCombine';

export interface SSBActions {
  addReactionMsg$: Stream<PressAddReactionEvent>;
  toggleHashtagSubscribe$: Stream<boolean>;
}

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  state$: Stream<State>,
): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$
    .map(toVoteContent)
    .map(contentToPublishReq);

  const updateHashtagsSubscribed$ = actions.toggleHashtagSubscribe$
    .compose(sampleCombine(state$))
    .map(([shouldSubscribe, state]) =>
      toChannelSubscribeContent(state.query, shouldSubscribe),
    )
    .map(contentToPublishReq);

  return xs.merge(addReaction$, updateHashtagsSubscribed$);
}
