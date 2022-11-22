// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
import {removeItem, setItem} from '~frontend/drivers/asyncstorage';
import {State} from './model';

export interface Actions {
  publishMsg$: Stream<any>;
}

export default function asyncStorage(actions: Actions, state$: Stream<State>) {
  const deleteWhenPublished$ = actions.publishMsg$
    .compose(sample(state$))
    .map((state) => removeItem(`replyDraft:${state.rootMsgId}`));

  const deleteDraft$ = state$
    .compose(dropRepeats((s1, s2) => s1.replyText === s2.replyText))
    .filter((state) => state.replyText.length === 0)
    .map((state) => removeItem(`replyDraft:${state.rootMsgId}`));

  const saveDraft$ = xs
    .periodic(1000)
    .endWhen(deleteWhenPublished$)
    .compose(sample(state$))
    .compose(dropRepeats((s1, s2) => s1.replyText === s2.replyText))
    .filter((state) => state.replyText.length > 0)
    .map((state) => setItem(`replyDraft:${state.rootMsgId}`, state.replyText));

  return xs.merge(deleteWhenPublished$, deleteDraft$, saveDraft$);
}
