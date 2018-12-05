/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {State} from './model';
import {toVoteContent, toContactContent} from '../../../ssb/to-ssb';
import {Req, contentToPublishReq} from '../../drivers/ssb';

export type SSBActions = {
  likeMsg$: Stream<{msgKey: string; like: boolean}>;
  follow$: Stream<boolean>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  state$: Stream<State>,
): Stream<Req> {
  const toggleLikeMsg$ = actions.likeMsg$.map(toVoteContent);

  const followProfileMsg$ = actions.follow$
    .compose(sampleCombine(state$))
    .map(([following, state]) => {
      return toContactContent(state.displayFeedId, following);
    });

  return xs.merge(toggleLikeMsg$, followProfileMsg$).map(contentToPublishReq);
}
