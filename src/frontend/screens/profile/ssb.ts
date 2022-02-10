// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import {State} from './model';
import {Req, contentToPublishReq} from '~frontend/drivers/ssb';
import {toVoteContent, toContactContent} from '~frontend/ssb/utils/to-ssb';
import {PressAddReactionEvent} from '~frontend/ssb/types';

export interface SSBActions {
  addReactionMsg$: Stream<PressAddReactionEvent>;
  follow$: Stream<boolean>;
  blockContact$: Stream<null>;
  blockSecretlyContact$: Stream<null>;
  unblockContact$: Stream<null>;
  unblockSecretlyContact$: Stream<null>;
}

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  state$: Stream<State>,
): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$.map(toVoteContent);

  const followContactMsg$ = actions.follow$
    .compose(sampleCombine(state$))
    .map(([following, state]) =>
      toContactContent(state.displayFeedId, following),
    );

  const blockContactMsg$ = actions.blockContact$
    .compose(sample(state$))
    .map((state) => toContactContent(state.displayFeedId, null, true));

  const blockSecretlyContactMsg$ = actions.blockSecretlyContact$
    .compose(sample(state$))
    .map((state) => {
      const content = toContactContent(state.displayFeedId, null, true);
      content.recps = [state.selfFeedId];
      return content;
    });

  const unblockContactMsg$ = actions.unblockContact$
    .compose(sample(state$))
    .map((state) => toContactContent(state.displayFeedId, null, false));

  const unblockSecretelyContactMsg$ = actions.unblockSecretlyContact$
    .compose(sample(state$))
    .map((state) => {
      const content = toContactContent(state.displayFeedId, null, false);
      content.recps = [state.selfFeedId];
      return content;
    });

  return xs
    .merge(
      addReaction$,
      followContactMsg$,
      blockContactMsg$,
      blockSecretlyContactMsg$,
      unblockContactMsg$,
      unblockSecretelyContactMsg$,
    )
    .map(contentToPublishReq);
}
