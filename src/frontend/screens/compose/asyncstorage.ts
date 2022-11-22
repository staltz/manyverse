// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import sample from 'xstream-sample';
import {State, isReply} from './model';
import {removeItem, setItem} from '~frontend/drivers/asyncstorage';

export interface Actions {
  publishPost$: Stream<any>;
  publishReply$: Stream<any>;
}

export default function asyncStorage(actions: Actions, state$: Stream<State>) {
  const deleteReplyWhenPublished$ = actions.publishReply$
    .compose(sample(state$))
    .map((state) => removeItem(`replyDraft:${state.root}`));

  const deletePostWhenPublished$ = actions.publishPost$.map(() =>
    removeItem('composeDraft'),
  );

  const deleteDraft$ = state$
    .compose(dropRepeats((s1, s2) => s1.postText === s2.postText))
    .filter((state) => state.postText.length === 0)
    .map((state) => {
      if (isReply(state)) {
        return removeItem(`replyDraft:${state.root}`);
      } else {
        return removeItem('composeDraft');
      }
    });

  const saveDraft$ = xs
    .periodic(1000)
    .endWhen(xs.merge(deletePostWhenPublished$, deleteReplyWhenPublished$))
    .compose(sample(state$))
    .compose(dropRepeats((s1, s2) => s1.postText === s2.postText))
    .filter((state) => state.postText.length > 0)
    .map((state) => {
      if (isReply(state)) {
        return setItem(`replyDraft:${state.root}`, state.postText);
      } else {
        return setItem('composeDraft', state.postText);
      }
    });

  const lastSession$ = xs
    .merge(actions.publishPost$, actions.publishReply$)
    .map(() => setItem('lastSessionTimestamp', `${Date.now() + 2e3}`));

  return xs.merge(
    deletePostWhenPublished$,
    deleteReplyWhenPublished$,
    deleteDraft$,
    saveDraft$,
    lastSession$,
  );
}
