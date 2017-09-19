/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import xs, {Stream, Listener} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {SSBSource} from '../../drivers/ssb';
import {StateSource, Reducer} from 'cycle-onionify';
import {FeedId, About, Msg, isVoteMsg} from '../../ssb/types';
import {Actions} from './intent';

export type State = {
  visible: boolean;
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(): State {
    return {visible: false};
  });

  const setVisibleReducer$ = actions.willAppear$.mapTo(
    function setVisibleReducer(prevState: State | undefined): State {
      return {visible: true};
    }
  );

  const setInvisibleReducer$ = actions.willDisappear$.mapTo(
    function setInvisibleReducer(prevState: State | undefined): State {
      return {visible: false};
    }
  );

  return xs.merge(initReducer$, setVisibleReducer$, setInvisibleReducer$);
}
