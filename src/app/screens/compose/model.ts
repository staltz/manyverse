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

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from 'cycle-onionify';
import {State as PublishButtonState} from './publish-button';

export type State = {
  postText: string;
};

export const publishButtonLens: Lens<State, PublishButtonState> = {
  get: (parent: State): PublishButtonState => {
    return {
      enabled: parent.postText.length > 0,
    };
  },

  // Ignore writes from the child
  set: (parent: State, child: PublishButtonState): State => {
    return parent;
  },
};

export type Actions = {
  updatePostText$: Stream<string>;
  willDisappear$: Stream<any>;
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {postText: ''};
  });

  const updatePostTextReducer$ = actions.updatePostText$.map(
    text =>
      function updatePostTextReducer(prev?: State): State {
        return {postText: text};
      },
  );

  const clearReducer$ = actions.willDisappear$.mapTo(
    function clearReducer(): State {
      return {postText: ''};
    },
  );

  return xs.merge(initReducer$, updatePostTextReducer$, clearReducer$);
}
