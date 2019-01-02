/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import {State} from './model';
import {toVoteContent, toContactContent} from '../../../ssb/to-ssb';
import {Req, contentToPublishReq} from '../../drivers/ssb';

export type SSBActions = {
  likeMsg$: Stream<{msgKey: string; like: boolean}>;
  follow$: Stream<boolean>;
  blockContact$: Stream<null>;
  blockSecretlyContact$: Stream<null>;
  unblockContact$: Stream<null>;
  unblockSecretlyContact$: Stream<null>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  state$: Stream<State>,
): Stream<Req> {
  const toggleLikeMsg$ = actions.likeMsg$.map(toVoteContent);

  const followContactMsg$ = actions.follow$
    .compose(sampleCombine(state$))
    .map(([following, state]) =>
      toContactContent(state.displayFeedId, following),
    );

  const blockContactMsg$ = actions.blockContact$
    .compose(sample(state$))
    .map(state => toContactContent(state.displayFeedId, null, true));

  const blockSecretlyContactMsg$ = actions.blockSecretlyContact$
    .compose(sample(state$))
    .map(state => {
      const content = toContactContent(state.displayFeedId, null, true);
      content.recps = [state.selfFeedId];
      return content;
    });

  const unblockContactMsg$ = actions.unblockContact$
    .compose(sample(state$))
    .map(state => toContactContent(state.displayFeedId, null, false));

  const unblockSecretelyContactMsg$ = actions.unblockSecretlyContact$
    .compose(sample(state$))
    .map(state => {
      const content = toContactContent(state.displayFeedId, null, false);
      content.recps = [state.selfFeedId];
      return content;
    });

  return xs
    .merge(
      toggleLikeMsg$,
      followContactMsg$,
      blockContactMsg$,
      blockSecretlyContactMsg$,
      unblockContactMsg$,
      unblockSecretelyContactMsg$,
    )
    .map(contentToPublishReq);
}
