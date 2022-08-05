// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import {State} from './model';
import {Req, contentToPublishReq, SSBSource} from '~frontend/drivers/ssb';
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

type StateAndBlurhash = [State, string | undefined];

function maybeFetchBlurhashWithSSB(ssbSource: SSBSource, state: State) {
  if (state.about.image) {
    return ssbSource
      .generateBlurhash$(state.about.image)
      .replaceError((err) => xs.of(undefined))
      .map((blurhash) => [state, blurhash]);
  } else {
    return xs.of([state, undefined]);
  }
}

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  ssbSource: SSBSource,
  state$: Stream<State>,
): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$.map(toVoteContent);

  const followContactMsg$ = actions.follow$
    .compose(sampleCombine(state$))
    .map(([following, state]) =>
      toContactContent(state.displayFeedId, {following}),
    );

  const maybeFetchBlurhash = maybeFetchBlurhashWithSSB.bind(null, ssbSource);

  const blockContactMsg$ = actions.blockContact$
    .compose(sample(state$))
    .map<Stream<StateAndBlurhash>>(maybeFetchBlurhash)
    .flatten()
    .map(([state, blurhash]) =>
      toContactContent(state.displayFeedId, {
        following: null,
        blocking: true,
        name: state.about.name,
        blurhash,
      }),
    );

  const blockSecretlyContactMsg$ = actions.blockSecretlyContact$
    .compose(sample(state$))
    .map<Stream<StateAndBlurhash>>(maybeFetchBlurhash)
    .flatten()
    .map(([state, blurhash]) => {
      const content = toContactContent(state.displayFeedId, {
        following: null,
        blocking: true,
        name: state.about.name,
        blurhash,
      });
      content.recps = [state.selfFeedId];
      return content;
    });

  const unblockContactMsg$ = actions.unblockContact$
    .compose(sample(state$))
    .map((state) =>
      toContactContent(state.displayFeedId, {following: null, blocking: false}),
    );

  const unblockSecretelyContactMsg$ = actions.unblockSecretlyContact$
    .compose(sample(state$))
    .map((state) => {
      const content = toContactContent(state.displayFeedId, {
        following: null,
        blocking: false,
      });
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
