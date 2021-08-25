/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
