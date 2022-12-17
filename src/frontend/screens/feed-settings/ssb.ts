// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {contentToPublishReq, Req} from '~frontend/drivers/ssb';
import {toChannelSubscribeContent} from '~frontend/ssb/utils/to-ssb';
import {HashtagSubscribeEvent} from './intent';

export interface SSBActions {
  toggleHashtagSubscribe$: Stream<HashtagSubscribeEvent>;
}

export default function ssb(actions: SSBActions): Stream<Req> {
  const updateHashtagsSubscribed$ = actions.toggleHashtagSubscribe$
    .map(({hashtag, shouldSubscribe}) =>
      toChannelSubscribeContent(hashtag, shouldSubscribe),
    )
    .map(contentToPublishReq);

  return xs.merge(updateHashtagsSubscribed$);
}
