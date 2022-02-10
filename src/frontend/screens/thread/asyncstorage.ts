// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
import {Command} from 'cycle-native-asyncstorage';
import {State} from './model';

export type Actions = {
  publishMsg$: Stream<any>;
};

export default function asyncStorage(actions: Actions, state$: Stream<State>) {
  const deleteWhenPublished$ = actions.publishMsg$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'removeItem',
        key: `replyDraft:${state.rootMsgId}`,
      } as Command),
  );

  const deleteDraft$ = state$
    .compose(dropRepeats((s1, s2) => s1.replyText === s2.replyText))
    .filter((state) => state.replyText.length === 0)
    .map(
      (state) =>
        ({type: 'removeItem', key: `replyDraft:${state.rootMsgId}`} as Command),
    );

  const saveDraft$ = xs
    .periodic(1000)
    .endWhen(deleteWhenPublished$)
    .compose(sample(state$))
    .compose(dropRepeats((s1, s2) => s1.replyText === s2.replyText))
    .filter((state) => state.replyText.length > 0)
    .map(
      (state) =>
        ({
          type: 'setItem',
          key: `replyDraft:${state.rootMsgId}`,
          value: state.replyText,
        } as Command),
    );

  return xs.merge(deleteWhenPublished$, deleteDraft$, saveDraft$);
}
