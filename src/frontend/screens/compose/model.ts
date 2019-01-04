/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from '@cycle/state';
import {State as TopBarState} from './top-bar';
import {SSBSource} from '../../drivers/ssb';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';

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
  asyncStorageSource: AsyncStorageSource,
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

  const getComposeDraftReducer$ = asyncStorageSource
    .getItem('composeDraft')
    .filter(str => !!str)
    .map(
      composeDraft =>
        function getComposeDraftReducer(prev: State): State {
          return {...prev, postText: composeDraft};
        },
    );

  return xs.merge(
    initReducer$,
    updatePostTextReducer$,
    aboutReducer$,
    getComposeDraftReducer$,
  );
}
