/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {toVoteContent} from '../../../ssb/utils/to-ssb';
import {contentToPublishReq, Req} from '../../../drivers/ssb';

export type LikeEvent = {msgKey: string; like: boolean};

export type Actions = {
  likeMsg$: Stream<LikeEvent>;
  initializationDone$: Stream<any>;
};

export default function ssb(actions: Actions): Stream<Req> {
  const toggleLikeMsg$ = actions.likeMsg$
    .map(toVoteContent)
    .map(contentToPublishReq);

  const startDht$ = actions.initializationDone$
    .take(1)
    .map(() => ({type: 'conn.start'} as Req));

  return xs.merge(toggleLikeMsg$, startDht$);
}
