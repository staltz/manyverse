/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-asyncstorage';
import {State} from './model';

export type Actions = {
  publishPost$: Stream<any>;
  publishReply$: Stream<any>;
  exitPost$: Stream<any>;
  exitReply$: Stream<any>;
  exitSavingPostDraft$: Stream<any>;
  exitDeletingPostDraft$: Stream<any>;
};

export default function asyncStorage(actions: Actions, state$: Stream<State>) {
  const savePostDraft$ = actions.exitSavingPostDraft$
    .compose(sample(state$))
    .map(
      (state) =>
        ({
          type: 'setItem',
          key: 'composeDraft',
          value: state.postText,
        } as Command),
    );

  const deletePostDraft$ = xs
    .merge(
      actions.exitPost$,
      actions.exitDeletingPostDraft$,
      actions.publishPost$,
    )
    .map(
      () =>
        ({
          type: 'removeItem',
          key: 'composeDraft',
        } as Command),
    );

  const saveReplyDraft$ = actions.exitReply$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'setItem',
        key: `replyDraft:${state.root}`,
        value: state.postText,
      } as Command),
  );

  const deleteReplyDraft$ = actions.publishReply$
    .compose(sample(state$))
    .map(
      (state) =>
        ({type: 'removeItem', key: `replyDraft:${state.root}`} as Command),
    );

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
    savePostDraft$,
    deletePostDraft$,
    saveReplyDraft$,
    deleteReplyDraft$,
    lastSession$,
  );
}
