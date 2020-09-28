/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';

export type State = {
  content: string;
};

export type Actions = {
  updateContent$: Stream<string>;
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {content: ''};
  });

  const updatePostTextReducer$ = actions.updateContent$.map(
    (text) =>
      function updatePostTextReducer(prev?: State): State {
        return {content: text};
      },
  );

  return xs.merge(initReducer$, updatePostTextReducer$);
}
