// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {toVoteContent} from '~frontend/ssb/utils/to-ssb';
import {contentToPublishReq, Req} from '~frontend/drivers/ssb';
import {PressAddReactionEvent} from '~frontend/ssb/types';

export interface Actions {
  addReactionMsg$: Stream<PressAddReactionEvent>;
  initializationDone$: Stream<any>;
}

export default function ssb(actions: Actions): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$
    .map(toVoteContent)
    .map(contentToPublishReq);

  const startConn$ = actions.initializationDone$
    .take(1)
    .map(() => ({type: 'conn.start'} as Req));

  return xs.merge(addReaction$, startConn$);
}
