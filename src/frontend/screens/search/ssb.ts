// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Req, contentToPublishReq} from '../../drivers/ssb';
import {toVoteContent} from '../../ssb/utils/to-ssb';
import {PressAddReactionEvent} from '../../ssb/types';

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
