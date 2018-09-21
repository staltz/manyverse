/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import {Reducer} from 'cycle-onionify';
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
