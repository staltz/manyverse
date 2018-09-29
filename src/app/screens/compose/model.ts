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
import {Reducer, Lens} from 'cycle-onionify';
import {State as TopBarState} from './top-bar';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  postText: string;
  avatarUrl: string | undefined;
};

export const topBarLens: Lens<State, TopBarState> = {
  get: (parent: State): TopBarState => {
    return {
      enabled: parent.postText.length > 0,
    };
  },

  // Ignore writes from the child
  set: (parent: State, child: TopBarState): State => {
    return parent;
  },
};

export type Actions = {
  updatePostText$: Stream<string>;
};

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) return prev;
    return {postText: '', avatarUrl: undefined};
  });

  const updatePostTextReducer$ = actions.updatePostText$.map(
    text =>
      function updatePostTextReducer(prev: State): State {
        return {postText: text, avatarUrl: prev.avatarUrl};
      },
  );

  const aboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map(selfFeedId => ssbSource.profileAbout$(selfFeedId))
    .flatten()
    .map(
      about =>
        function aboutReducer(prev: State): State {
          return {postText: prev.postText, avatarUrl: about.imageUrl};
        },
    );

  return xs.merge(initReducer$, updatePostTextReducer$, aboutReducer$);
}
