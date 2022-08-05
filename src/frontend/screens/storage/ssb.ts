// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId} from 'ssb-typescript';
import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {contentToPublishReq, Req, SSBSource} from '~frontend/drivers/ssb';
import {PressBlockAccount} from '~frontend/ssb/types';
import {toContactContent} from '~frontend/ssb/utils/to-ssb';
import {State} from './model';

interface Actions {
  updateBlobsStorage$: Stream<number>;
  blockContact$: Stream<PressBlockAccount>;
  blockSecretlyContact$: Stream<PressBlockAccount>;
  unblockContact$: Stream<FeedId>;
  unblockSecretlyContact$: Stream<FeedId>;
}

type EventAndBlurhash = [PressBlockAccount, string | undefined];

function maybeFetchBlurhashWithSSB(
  ssbSource: SSBSource,
  pressEvent: PressBlockAccount,
) {
  if (pressEvent.image) {
    return ssbSource
      .generateBlurhash$(pressEvent.image)
      .replaceError((err) => xs.of(undefined))
      .map((blurhash) => [pressEvent, blurhash]);
  } else {
    return xs.of([pressEvent, undefined]);
  }
}

export default function ssb(
  actions: Actions,
  ssbSource: SSBSource,
  state$: Stream<State>,
) {
  const blobsPurgeReq$ = actions.updateBlobsStorage$.map(
    (storageLimit) => ({type: 'settings.blobsPurge', storageLimit} as Req),
  );

  const maybeFetchBlurhash = maybeFetchBlurhashWithSSB.bind(null, ssbSource);

  const blockContactMsg$ = actions.blockContact$
    .map<Stream<EventAndBlurhash>>(maybeFetchBlurhash)
    .flatten()
    .map(([{feedId, name}, blurhash]) =>
      toContactContent(feedId, {
        following: null,
        blocking: true,
        name,
        blurhash,
      }),
    );

  const blockSecretlyContactMsg$ = actions.blockSecretlyContact$
    .map<Stream<EventAndBlurhash>>(maybeFetchBlurhash)
    .flatten()
    .compose(sampleCombine(state$))
    .map(([[{feedId, name}, blurhash], state]) => {
      const content = toContactContent(feedId, {
        following: null,
        blocking: true,
        name,
        blurhash,
      });
      content.recps = [state.selfFeedId];
      return content;
    });

  const unblockContactMsg$ = actions.unblockContact$.map((feedId) =>
    toContactContent(feedId, {following: null, blocking: false}),
  );

  const unblockSecretelyContactMsg$ = actions.unblockSecretlyContact$
    .compose(sampleCombine(state$))
    .map(([feedId, state]) => {
      const content = toContactContent(feedId, {
        following: null,
        blocking: false,
      });
      content.recps = [state.selfFeedId];
      return content;
    });

  const publishReq$ = xs
    .merge(
      blockContactMsg$,
      blockSecretlyContactMsg$,
      unblockContactMsg$,
      unblockSecretelyContactMsg$,
    )
    .map(contentToPublishReq);

  return xs.merge(blobsPurgeReq$, publishReq$);
}
