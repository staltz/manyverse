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
import {Image} from 'react-native-image-crop-picker';
import {Props} from './index';
import {MsgId} from 'ssb-typescript';

export type State = {
  postText: string;
  contentWarning: string;
  avatarUrl: string | undefined;
  previewing: boolean;
  root: MsgId | undefined;
};

export const topBarLens: Lens<State, TopBarState> = {
  get: (parent: State): TopBarState => {
    return {
      enabled: parent.postText.length > 0,
      previewing: parent.previewing,
      isReply: !!parent.root,
    };
  },

  // Ignore writes from the child
  set: (parent: State, child: TopBarState): State => {
    return parent;
  },
};

export type Actions = {
  updatePostText$: Stream<string>;
  updateContentWarning$: Stream<string>;
  togglePreview$: Stream<any>;
  addPictureWithCaption$: Stream<{caption: string; image: Image}>;
};

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    props =>
      function propsReducer(): State {
        return {
          postText: props.text || '',
          root: props.root,
          contentWarning: '',
          avatarUrl: undefined,
          previewing: false,
        };
      },
  );

  const updatePostTextReducer$ = actions.updatePostText$.map(
    postText =>
      function updatePostTextReducer(prev: State): State {
        return {...prev, postText};
      },
  );

  const addPictureReducer$ = actions.addPictureWithCaption$
    .map(({caption, image}) =>
      ssbSource.addBlobFromPath$(image.path.replace('file://', '')).map(
        blobId =>
          function addPictureReducer(prev: State): State {
            let separator = '';
            if (prev.postText.trim().length > 0) {
              // Count how many new lines are already at the end of the postText
              const res = /(\n+)$/g.exec(prev.postText);
              const prevLines =
                !res || !res[0] ? 0 : res[0].split('\n').length - 1;

              // Count how many new lines to add, in order to create space
              const addLines = Math.max(2 - prevLines, 0);
              separator = Array(addLines + 1).join('\n');
            }

            const imgMarkdown = `![${caption || 'image'}](${blobId})`;

            return {
              ...prev,
              postText: prev.postText + separator + imgMarkdown + '\n\n',
            };
          },
      ),
    )
    .flatten();

  const updateContentWarningReducer$ = actions.updateContentWarning$.map(
    contentWarning =>
      function updateContentWarningReducer(prev: State): State {
        return {...prev, contentWarning};
      },
  );

  const aboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map(selfFeedId => ssbSource.profileAbout$(selfFeedId))
    .flatten()
    .map(
      about =>
        function aboutReducer(prev: State): State {
          return {...prev, avatarUrl: about.imageUrl};
        },
    );

  const togglePreviewReducer$ = actions.togglePreview$.mapTo(
    function togglePreviewReducer(prev: State): State {
      return {...prev, previewing: !prev.previewing};
    },
  );

  const getComposeDraftReducer$ = asyncStorageSource
    .getItem('composeDraft')
    .filter(str => !!str)
    .map(
      composeDraft =>
        function getComposeDraftReducer(prev: State): State {
          if (prev.root) {
            return prev;
          } else {
            return {...prev, postText: composeDraft!};
          }
        },
    );

  return xs.merge(
    propsReducer$,
    updatePostTextReducer$,
    addPictureReducer$,
    updateContentWarningReducer$,
    togglePreviewReducer$,
    aboutReducer$,
    getComposeDraftReducer$,
  );
}
