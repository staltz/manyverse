/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Reducer, Lens} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Image} from 'react-native-image-crop-picker';
import {MsgId, FeedId} from 'ssb-typescript';
import {SSBSource, MentionSuggestion} from '../../drivers/ssb';
import {State as TopBarState} from './top-bar';
import {Props} from './index';

type Selection = {start: number; end: number};

export type State = {
  postText: string;
  postTextSelection: Selection;
  mentionQuery: string;
  mentionSuggestions: Array<MentionSuggestion>;
  mentionChoiceTimestamp: number;
  contentWarning: string;
  avatarUrl: string | undefined;
  previewing: boolean;
  root: MsgId | undefined;
  authors: Array<FeedId>;
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

export function isPost(state: State): boolean {
  return !state.root;
}

export function isReply(state: State): boolean {
  return !!state.root;
}

export function isTextEmpty(state: State): boolean {
  return !state.postText;
}

export function hasText(state: State): boolean {
  return state.postText.length > 0;
}

export function parseMention(
  postText: string,
  selection: Selection,
): string | null {
  if (selection.start !== selection.end) return null;
  const results = /(^| )@(\w+)$/gm.exec(postText.substr(0, selection.start));
  return results?.[2] ?? null;
}

export type Actions = {
  updatePostText$: Stream<string>;
  updateSelection$: Stream<Selection>;
  updateMentionQuery$: Stream<string>;
  suggestMention$: Stream<[string | null, Selection]>;
  chooseMention$: Stream<{name: string; id: FeedId}>;
  cancelMention$: Stream<any>;
  updateContentWarning$: Stream<string>;
  togglePreview$: Stream<any>;
  addPictureWithCaption$: Stream<{caption: string; image: Image}>;
};

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  state$: Stream<State>,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    props =>
      function propsReducer(): State {
        return {
          postText: props.text ?? '',
          postTextSelection: props.text
            ? {start: props.text.length, end: props.text.length}
            : {start: 0, end: 0},
          mentionQuery: '',
          mentionSuggestions: [],
          mentionChoiceTimestamp: 0,
          root: props.root,
          authors: props.authors ?? [],
          contentWarning: '',
          avatarUrl: undefined,
          previewing: false,
        };
      },
  );

  const updateSelectionReducer$ = actions.updateSelection$.map(
    postTextSelection =>
      function updateCursorPositionReducer(prev: State): State {
        // If the mention TextInput is open, dont update the postText selection
        if (prev.mentionQuery) {
          return prev;
        } else {
          return {...prev, postTextSelection};
        }
      },
  );

  const updatePostTextReducer$ = actions.updatePostText$.map(
    postText =>
      function updatePostTextReducer(prev: State): State {
        return {...prev, postText};
      },
  );

  const updateMentionSuggestionsReducer1$ = actions.suggestMention$
    .compose(sampleCombine(state$))
    .map(([[mentionQuery, selection], state]) =>
      ssbSource
        .getMentionSuggestions(mentionQuery, state.authors)
        .map(
          suggestions =>
            [suggestions, selection] as [Array<MentionSuggestion>, Selection],
        ),
    )
    .flatten()
    .map(
      ([mentionSuggestions, prevSelection]) =>
        function updateMentionSuggestionsReducer1(prev: State): State {
          let mentionQuery = parseMention(prev.postText, prevSelection);
          const cursor = prevSelection.start;
          if (mentionSuggestions.length && mentionQuery) {
            mentionQuery = '@' + mentionQuery;
            const mentionPosition = cursor - mentionQuery.length;
            const preMention = prev.postText.substr(0, mentionPosition);
            const postMention = prev.postText.substr(cursor);
            const postText = preMention + postMention;
            const postTextSelection = {
              start: cursor - mentionQuery.length,
              end: cursor - mentionQuery.length,
            };
            return {
              ...prev,
              postText,
              postTextSelection,
              mentionQuery,
              mentionSuggestions,
            };
          } else {
            return {...prev, mentionSuggestions};
          }
        },
    );

  const updateMentionQueryReducer$ = actions.updateMentionQuery$.map(
    mentionQuery =>
      function updateMentionQueryReducer(prev: State): State {
        if (mentionQuery.length) {
          return {...prev, mentionQuery};
        } else {
          return {...prev, mentionQuery, mentionSuggestions: []};
        }
      },
  );

  const updateMentionSuggestionsReducer2$ = actions.updateMentionQuery$
    .compose(sampleCombine(state$))
    .map(([mentionQuery, state]) =>
      ssbSource.getMentionSuggestions(
        mentionQuery.replace(/^@+/g, ''),
        state.authors,
      ),
    )
    .flatten()
    .map(
      mentionSuggestions =>
        function updateMentionSuggestionsReducer2(prev: State): State {
          return {...prev, mentionSuggestions};
        },
    );

  const chooseMentionReducer$ = actions.chooseMention$.map(
    chosen =>
      function chooseMentionReducer(prev: State): State {
        const cursor = prev.postTextSelection.start;
        const preMention = prev.postText.substr(0, cursor);
        const postMention = prev.postText.substr(cursor);
        const mention = `[@${chosen.name}](${chosen.id}) `;
        const postText = preMention + mention + postMention;
        const postTextSelection = {
          start: cursor + mention.length,
          end: cursor + mention.length,
        };
        return {
          ...prev,
          postText,
          postTextSelection,
          mentionQuery: '',
          mentionSuggestions: [],
          mentionChoiceTimestamp: Date.now(),
        };
      },
  );

  const cancelMentionReducer$ = actions.cancelMention$.mapTo(
    function cancelMentionReducer(prev: State): State {
      const cursor = prev.postTextSelection.start;
      const preMention = prev.postText.substr(0, cursor);
      const postMention = prev.postText.substr(cursor);
      const mention = prev.mentionQuery + ' ';
      const postText = preMention + mention + postMention;
      const postTextSelection = {
        start: cursor + mention.length,
        end: cursor + mention.length,
      };
      return {
        ...prev,
        postText,
        postTextSelection,
        mentionQuery: '',
        mentionSuggestions: [],
        mentionChoiceTimestamp: Date.now(),
      };
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

            const imgMarkdown = `![${caption ?? 'image'}](${blobId})`;

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
    updateSelectionReducer$,
    updatePostTextReducer$,
    updateMentionQueryReducer$,
    updateMentionSuggestionsReducer1$,
    updateMentionSuggestionsReducer2$,
    chooseMentionReducer$,
    cancelMentionReducer$,
    addPictureReducer$,
    updateContentWarningReducer$,
    togglePreviewReducer$,
    aboutReducer$,
    getComposeDraftReducer$,
  );
}
