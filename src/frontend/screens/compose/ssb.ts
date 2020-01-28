/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {toPostContent, toReplyPostContent} from '../../ssb/utils/to-ssb';
import {Req, contentToPublishReq} from '../../drivers/ssb';
import {State} from './model';

export type Actions = {
  publishPost$: Stream<State>;
  publishReply$: Stream<State>;
};

export default function ssb(actions: Actions): Stream<Req> {
  const publishPost$ = actions.publishPost$
    .map(({postText, contentWarning}) =>
      toPostContent(postText, contentWarning),
    )
    .map(contentToPublishReq);

  const publishReply$ = actions.publishReply$
    .map(({postText, contentWarning, root, branch}) =>
      toReplyPostContent(postText, root!, branch, contentWarning),
    )
    .map(contentToPublishReq);

  return xs.merge(publishPost$, publishReply$);
}
