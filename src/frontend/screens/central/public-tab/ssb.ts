// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {toVoteContent} from '../../../ssb/utils/to-ssb';
import {contentToPublishReq, Req} from '../../../drivers/ssb';
import {PressAddReactionEvent} from '../../../ssb/types';

export type Actions = {
  addReactionMsg$: Stream<PressAddReactionEvent>;
  initializationDone$: Stream<any>;
};

export default function ssb(actions: Actions): Stream<Req> {
  const addReaction$ = actions.addReactionMsg$
    .map(toVoteContent)
    .map(contentToPublishReq);

  const startConn$ = actions.initializationDone$
    .take(1)
    .map(() => ({type: 'conn.start'} as Req));

  return xs.merge(addReaction$, startConn$);
}
