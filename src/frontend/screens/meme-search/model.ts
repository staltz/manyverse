// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {GetReadable} from '../../drivers/ssb';
const pull = require('pull-stream');

export type Meme = {
  name: string;
};

export interface State {
  meme$: GetReadable<Meme>;
  query: string;
}

interface Actions {}

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
  state$: Stream<State>,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initOrResetReducer(_prev?: State): State {
    return {
      meme$: pull.empty(),
      query: '',
    };
  });

  const memesReducer$ = state$.map(
    ({query}) =>
      function aboutsReducer(prev: State): State {
        const meme$ = pull.values([
          {name: 'asdf'},
          {name: 'hjkl'},
          {name: query},
        ]) as State['meme$'];
        return {...prev, meme$};
      },
  );

  return xs.merge(initReducer$, memesReducer$);
}
