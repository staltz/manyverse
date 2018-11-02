/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  inviteCode: string | null;
};

export default function model(ssbSource: SSBSource): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {inviteCode: null};
  });

  const createInviteCodeReducer$ = ssbSource.createDhtInvite$().map(
    inviteCode =>
      function createInviteCodeReducer(prev?: State): State {
        return {inviteCode};
      },
  );

  return xs.merge(initReducer$, createInviteCodeReducer$);
}
