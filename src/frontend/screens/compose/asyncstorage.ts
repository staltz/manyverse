/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-asyncstorage';
import {State} from './model';

export type Actions = {
  publishMsg$: Stream<any>;
  exit$: Stream<any>;
  exitSavingDraft$: Stream<any>;
  exitDeletingDraft$: Stream<any>;
};

export default function asyncStorage(actions: Actions, state$: Stream<State>) {
  const saveCommand$ = actions.exitSavingDraft$.compose(sample(state$)).map(
    state =>
      ({
        type: 'setItem',
        key: 'composeDraft',
        value: state.postText,
      } as Command),
  );

  const deleteCommand$ = xs
    .merge(actions.exit$, actions.exitDeletingDraft$, actions.publishMsg$)
    .map(
      () =>
        ({
          type: 'removeItem',
          key: 'composeDraft',
        } as Command),
    );

  return xs.merge(saveCommand$, deleteCommand$);
}
