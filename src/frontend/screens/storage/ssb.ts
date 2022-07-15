// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId} from 'ssb-typescript';
import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {contentToPublishReq, Req} from '~frontend/drivers/ssb';
import {toContactContent} from '~frontend/ssb/utils/to-ssb';
import {State} from './model';

interface Actions {
  updateBlobsStorage$: Stream<number>;
  blockContact$: Stream<FeedId>;
  blockSecretlyContact$: Stream<FeedId>;
  unblockContact$: Stream<FeedId>;
  unblockSecretlyContact$: Stream<FeedId>;
}

export default function ssb(actions: Actions, state$: Stream<State>) {
  const blobsPurgeReq$ = actions.updateBlobsStorage$.map(
    (storageLimit) => ({type: 'settings.blobsPurge', storageLimit} as Req),
  );

  const blockContactMsg$ = actions.blockContact$.map((feedId) =>
    toContactContent(feedId, null, true),
  );

  const blockSecretlyContactMsg$ = actions.blockSecretlyContact$
    .compose(sampleCombine(state$))
    .map(([feedId, state]) => {
      const content = toContactContent(feedId, null, true);
      content.recps = [state.selfFeedId];
      return content;
    });

  const unblockContactMsg$ = actions.unblockContact$.map((feedId) =>
    toContactContent(feedId, null, false),
  );

  const unblockSecretelyContactMsg$ = actions.unblockSecretlyContact$
    .compose(sampleCombine(state$))
    .map(([feedId, state]) => {
      const content = toContactContent(feedId, null, false);
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
