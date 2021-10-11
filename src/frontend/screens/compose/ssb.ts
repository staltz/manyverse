// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {toPostContent, toReplyPostContent} from '../../ssb/utils/to-ssb';
import {Req, contentToPublishReq} from '../../drivers/ssb';
import {State} from './model';

export type Actions = {
  publishPost$: Stream<State>;
  publishReply$: Stream<State>;
};

export default function ssb(actions: Actions): Stream<Req> {
  const publishPostContent$ = actions.publishPost$
    .filter(
      ({postText}) =>
        typeof postText === 'string' && postText.trim().length > 0,
    )
    .map(({postText, contentWarning}) =>
      toPostContent(postText, contentWarning),
    );

  const publishReplyContent$ = actions.publishReply$
    .filter(
      ({postText}) =>
        typeof postText === 'string' && postText.trim().length > 0,
    )
    .map(({postText, contentWarning, root, branch, fork}) =>
      toReplyPostContent({
        text: postText,
        root: root!,
        branch,
        fork,
        contentWarning,
      }),
    );

  const publishReq$ = xs
    .merge(publishPostContent$, publishReplyContent$)
    .map(contentToPublishReq)
    .take(1);

  return publishReq$;
}
