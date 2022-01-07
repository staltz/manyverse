// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-asyncstorage';
import {State, isReply} from './model';

export interface Actions {
  publishPost$: Stream<any>;
  publishReply$: Stream<any>;
}

export default function asyncStorage(actions: Actions, state$: Stream<State>) {
  const deleteReplyWhenPublished$ = actions.publishReply$
    .compose(sample(state$))
    .map(
      (state) =>
        ({type: 'removeItem', key: `replyDraft:${state.root}`} as Command),
    );

  const deletePostWhenPublished$ = actions.publishPost$.map(
    () => ({type: 'removeItem', key: 'composeDraft'} as Command),
  );

  const deleteDraft$ = state$
    .compose(dropRepeats((s1, s2) => s1.postText === s2.postText))
    .filter((state) => state.postText.length === 0)
    .map((state) => {
      if (isReply(state)) {
        return {type: 'removeItem', key: `replyDraft:${state.root}`} as Command;
      } else {
        return {type: 'removeItem', key: 'composeDraft'} as Command;
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
        return {
          type: 'setItem',
          key: `replyDraft:${state.root}`,
          value: state.postText,
        } as Command;
      } else {
        return {
          type: 'setItem',
          key: 'composeDraft',
          value: state.postText,
        } as Command;
      }
    });

  const lastSession$ = xs
    .merge(actions.publishPost$, actions.publishReply$)
    .map(
      () =>
        ({
          type: 'setItem',
          key: 'lastSessionTimestamp',
          value: `${Date.now() + 2e3}`,
        } as Command),
    );

  return xs.merge(
    deletePostWhenPublished$,
    deleteReplyWhenPublished$,
    deleteDraft$,
    saveDraft$,
    lastSession$,
  );
}
