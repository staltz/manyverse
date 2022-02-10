// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Req, contentToPublishReq} from '~frontend/drivers/ssb';
import {toVoteContent} from '~frontend/ssb/utils/to-ssb';
import {PressAddReactionEvent} from '~frontend/ssb/types';

export interface SSBActions {
  addReactionMsg$: Stream<PressAddReactionEvent>;
}

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(actions: SSBActions): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$
    .map(toVoteContent)
    .map(contentToPublishReq);

  return addReaction$;
}
