// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import sampleCombine from 'xstream/extra/sampleCombine';
import debounce from 'xstream/extra/debounce';
import {Reducer, Lens} from '@cycle/state';
import {Platform} from 'react-native';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Image} from 'react-native-image-crop-picker';
import {MsgId, FeedId} from 'ssb-typescript';
import {SSBSource, MentionSuggestion} from '../../drivers/ssb';
import {State as TopBarState} from './top-bar';
import {Props} from './index';

interface Selection {
  start: number;
  end: number;
}

export interface State {
  postText: string;
  postTextOverride: string;
  postTextSelection: Selection;
  mentionQuery: string;
  mentionSuggestions: Array<MentionSuggestion & {imageUrl?: string}>;
  mentionChoiceTimestamp: number;
  contentWarning: string;
  contentWarningPreviewOpened: boolean;
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  selfName: string | undefined;
  previewing: boolean;
  root: MsgId | undefined;
  fork: MsgId | undefined;
  branch: MsgId | undefined;
  authors: Array<FeedId>;
}

const MAX_SUGGESTIONS = Platform.OS === 'web' ? 6 : 4;

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
  const cursor = selection.start;
  const cursorTilNextSpace = postText.slice(cursor).search(/\s/);
  const endOfWord =
    cursorTilNextSpace >= 0 ? cursor + cursorTilNextSpace : postText.length;
  const results = /(^| )@(\S+)$/gm.exec(postText.substr(0, endOfWord));
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

export interface Actions {
  updatePostText$: Stream<string>;
  updateSelection$: Stream<Selection>;
  chooseMention$: Stream<FeedId>;
  cancelMention$: Stream<any>;
  updateContentWarning$: Stream<string>;
  toggleContentWarningPreview$: Stream<any>;
  disablePreview$: Stream<any>;
  enablePreview$: Stream<any>;
  addAudio$: Stream<string>;
  addPictureWithCaption$: Stream<{caption: string; image: Image}>;
}

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
          contentWarningPreviewOpened: true,
          selfAvatarUrl: props.selfAvatarUrl,
          selfFeedId: props.selfFeedId,
          selfName: undefined,
          previewing: false,
        };
      },
  );

  const selfNameReducer$ = props$
    .take(1)
    .map((props) => ssbSource.profileAboutLive$(props.selfFeedId))
    .flatten()
    .map(
      (about) =>
        function aboutReducer(prev: State): State {
          if (!!about.name && about.name !== about.id) {
            return {...prev, selfName: about.name};
          } else {
            return prev;
          }
        },
    );

  const updatePostTextReducer$ = actions.updatePostText$.map(
    (postText) =>
      function updatePostTextReducer(prev: State): State {
        return {...prev, postText};
      },
  );

  const selectionAndState$ = actions.updateSelection$
    .compose(sampleCombine(state$))
    .compose(debounce(100));

  const openMentionSuggestionsReducer$ = selectionAndState$
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
        function openMentionSuggestionsReducer(prev: State): State {
          let mentionQuery = parseMention(prev.postText, prevSelection);
          const cursor = prevSelection.start;
          if (mentionSuggestions.length && mentionQuery) {
            mentionQuery = '@' + mentionQuery;
            const postTextSelection = {
              start: cursor - mentionQuery.length,
              end: cursor - mentionQuery.length,
            };
            return {
              ...prev,
              postTextSelection,
              mentionQuery,
              mentionSuggestions: mentionSuggestions.slice(0, MAX_SUGGESTIONS),
            };
          } else {
            return {
              ...prev,
              mentionSuggestions: mentionSuggestions.slice(0, MAX_SUGGESTIONS),
            };
          }
        },
    );

  const ignoreMentionSuggestionsReducer$ = selectionAndState$.map(
    ([selection, state]) =>
      function ignoreMentionSuggestionsReducer(prev: State): State {
        const mentionQuery = parseMention(state.postText, selection);
        if (!mentionQuery && prev.mentionSuggestions.length > 0) {
          return {...prev, mentionSuggestions: []};
        } else {
          return prev;
        }
      },
  );

  const chooseMentionReducer$ = actions.chooseMention$.map(
    (chosenId) =>
      function chooseMentionReducer(prev: State): State {
        const cursor = prev.postTextSelection.start;
        const preMention = prev.postText.substr(0, cursor);
        const postMention = prev.postText
          .substr(cursor)
          .replace(prev.mentionQuery, '');
        const chosen = prev.mentionSuggestions.find((x) => x.id === chosenId);
        if (!chosen) return prev;
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
        postTextOverride: postText,
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
        return {
          ...prev,
          contentWarning,
          contentWarningPreviewOpened: contentWarning.length === 0,
        };
      },
  );

  const enablePreviewReducer$ = actions.enablePreview$.mapTo(
    function enablePreviewReducer(prev: State): State {
      return {...prev, previewing: true};
    },
  );

  const disablePreviewReducer$ = actions.disablePreview$.mapTo(
    function disablePreviewReducer(prev: State): State {
      return {
        ...prev,
        previewing: false,
        postTextOverride: prev.postText,
        postTextSelection: {
          start: prev.postText.length,
          end: prev.postText.length,
        },
      };
    },
  );

  const toggleContentWarningPreviewReducer$ = actions.toggleContentWarningPreview$.mapTo(
    function toggleContentWarningPreviewReducer(prev: State): State {
      return {
        ...prev,
        contentWarningPreviewOpened: !prev.contentWarningPreviewOpened,
      };
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
              postTextSelection: {
                start: composeDraft!.length,
                end: composeDraft!.length,
              },
            };
          }
        },
    );

  return concat(
    propsReducer$,
    xs.merge(
      selfNameReducer$,
      updatePostTextReducer$,
      openMentionSuggestionsReducer$,
      ignoreMentionSuggestionsReducer$,
      chooseMentionReducer$,
      cancelMentionReducer$,
      addPictureReducer$,
      addAudioReducer$,
      updateContentWarningReducer$,
      enablePreviewReducer$,
      disablePreviewReducer$,
      toggleContentWarningPreviewReducer$,
      getComposeDraftReducer$,
    ),
  );
}
