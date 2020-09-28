/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Props} from './index';

export type State = {
  practiceMode: boolean;
  backendWords: string | null;
  inputWords: string;
};

type Actions = {
  updateWords$: Stream<string>;
};

export default function model(props$: Stream<Props>, actions: Actions) {
  const initReducer$ = xs.of(function initReducer(): State {
    return {practiceMode: false, backendWords: '', inputWords: ''};
  });

  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(prev: State): State {
        if (typeof props.practiceMode !== 'undefined') {
          return {
            ...prev,
            practiceMode: props.practiceMode,
            backendWords: props.backendWords!,
          };
        } else {
          return prev;
        }
      },
  );

  const updateWordsReducer$ = actions.updateWords$.map(
    (text) =>
      function updateWordsReducer(prev: State): State {
        return {
          ...prev,
          inputWords: text
            .replace(/\d+/g, '') // no digits
            .replace('_', '') // no underscore
            .replace(/[^\w ]+/g, ''), // no misc symbols
        };
      },
  );

  return xs.merge(initReducer$, propsReducer$, updateWordsReducer$);
}
