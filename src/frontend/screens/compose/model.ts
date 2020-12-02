/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import debounce from 'xstream/extra/debounce';
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
  postTextOverride: string;
  postTextSelection: Selection;
  mentionQuery: string;
  mentionSuggestions: Array<MentionSuggestion>;
  mentionChoiceTimestamp: number;
  contentWarning: string;
  selfAvatarUrl?: string;
  previewing: boolean;
  root: MsgId | undefined;
  fork: MsgId | undefined;
  branch: MsgId | undefined;
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

function parseMention(postText: string, selection: Selection): string | null {
  if (selection.start !== selection.end) return null;
  const results = /(^| )@(\w+)$/gm.exec(postText.substr(0, selection.start));
  return results?.[2] ?? null;
}

function appendToPostText(postText: string, other: string) {
  let separator = '';
  if (postText.trim().length > 0) {
    // Count how many new lines are already at the end of the postText
    const res = /(\n+)$/g.exec(postText);
    const prevLines = !res || !res[0] ? 0 : res[0].split('\n').length - 1;

    // Count how many new lines to add, in order to create space
    const addLines = Math.max(2 - prevLines, 0);
    separator = Array(addLines + 1).join('\n');
  }

  return postText + separator + other + '\n\n';
}

export type Actions = {
  updatePostText$: Stream<string>;
  updateSelection$: Stream<Selection>;
  updateMentionQuery$: Stream<string>;
  chooseMention$: Stream<{name: string; id: FeedId}>;
  cancelMention$: Stream<any>;
  updateContentWarning$: Stream<string>;
  togglePreview$: Stream<any>;
  addAudio$: Stream<string>;
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
    (props) =>
      function propsReducer(): State {
        return {
          postText: props.text ?? '',
          postTextOverride: props.text ?? '',
          postTextSelection: props.text
            ? {start: props.text.length, end: props.text.length}
            : {start: 0, end: 0},
          mentionQuery: '',
          mentionSuggestions: [],
          mentionChoiceTimestamp: 0,
          root: props.root,
          fork: props.fork,
          branch: props.branch,
          authors: props.authors ?? [],
          contentWarning: '',
          selfAvatarUrl: props.selfAvatarUrl,
          previewing: false,
        };
      },
  );

  const updateSelectionReducer$ = actions.updateSelection$.map(
    (postTextSelection) =>
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
    (postText) =>
      function updatePostTextReducer(prev: State): State {
        return {...prev, postText};
      },
  );

  const updateMentionSuggestionsReducer1$ = actions.updateSelection$
    .compose(sampleCombine(state$))
    .compose(debounce(100))
    .map(([selection, state]) => {
      const mentionQuery = parseMention(state.postText, selection);
      if (!mentionQuery) return xs.never();

      return ssbSource
        .getMentionSuggestions(mentionQuery, state.authors)
        .map(
          (suggestions) =>
            [suggestions, selection] as [Array<MentionSuggestion>, Selection],
        );
    })
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
    (mentionQuery) =>
      function updateMentionQueryReducer(prev: State): State {
        if (mentionQuery.length) {
          return {...prev, mentionQuery};
        } else {
          return {...prev, mentionQuery, mentionSuggestions: []};
        }
      },
  );

  const updateMentionSuggestionsReducer2$ = actions.updateMentionQuery$
    .map((query) => query.replace(/^@+/g, ''))
    .compose(sampleCombine(state$))
    .map(([mentionQuery, state]) =>
      !mentionQuery
        ? xs.never()
        : ssbSource.getMentionSuggestions(mentionQuery, state.authors),
    )
    .flatten()
    .map(
      (mentionSuggestions) =>
        function updateMentionSuggestionsReducer2(prev: State): State {
          return {...prev, mentionSuggestions};
        },
    );

  const chooseMentionReducer$ = actions.chooseMention$.map(
    (chosen) =>
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
          postTextOverride: postText,
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
        (blobId) =>
          function addPictureReducer(prev: State): State {
            const imgMarkdown = `![${caption ?? 'image'}](${blobId})`;
            const postText = appendToPostText(prev.postText, imgMarkdown);
            const postTextSelection = {
              start: postText.length,
              end: postText.length,
            };
            return {
              ...prev,
              postText,
              postTextOverride: postText,
              postTextSelection,
            };
          },
      ),
    )
    .flatten();

  const addAudioReducer$ = actions.addAudio$.map(
    (blobId) =>
      function addAudioReducer(prev: State): State {
        const audioMarkdown = `![audio:recording.mp3](${blobId})`;
        const postText = appendToPostText(prev.postText, audioMarkdown);
        const postTextSelection = {
          start: postText.length,
          end: postText.length,
        };
        return {
          ...prev,
          postText,
          postTextOverride: postText,
          postTextSelection,
        };
      },
  );

  const updateContentWarningReducer$ = actions.updateContentWarning$.map(
    (contentWarning) =>
      function updateContentWarningReducer(prev: State): State {
        return {...prev, contentWarning};
      },
  );

  const togglePreviewReducer$ = actions.togglePreview$.mapTo(
    function togglePreviewReducer(prev: State): State {
      return {...prev, previewing: !prev.previewing};
    },
  );

  const getComposeDraftReducer$ = asyncStorageSource
    .getItem('composeDraft')
    .filter((str) => !!str)
    .map(
      (composeDraft) =>
        function getComposeDraftReducer(prev: State): State {
          if (prev.root) {
            return prev;
          } else {
            return {
              ...prev,
              postText: composeDraft!,
              postTextOverride: composeDraft!,
            };
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
    addAudioReducer$,
    updateContentWarningReducer$,
    togglePreviewReducer$,
    getComposeDraftReducer$,
  );
}
