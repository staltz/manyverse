// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import sampleCombine from 'xstream/extra/sampleCombine';
import debounce from 'xstream/extra/debounce';
import {Reducer, Lens} from '@cycle/state';
import {Platform} from 'react-native';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {MsgId, FeedId} from 'ssb-typescript';
import {
  SSBSource,
  HashtagSuggestion,
  MentionSuggestion,
  Suggestion,
} from '~frontend/drivers/ssb';
import {AudioBlobComposed} from '~frontend/drivers/eventbus';
import {MAX_MESSAGE_TEXT_SIZE} from '~frontend/ssb/utils/constants';
import {State as TopBarState} from './top-bar';
import {Props} from './index';
import {FileLite} from './types';

interface Selection {
  start: number;
  end: number;
}

type AutoCompleteSuggestions =
  | Array<HashtagSuggestion>
  | Array<MentionSuggestion>;

export interface State {
  postText: string;
  postTextOverride: string;
  postTextSelection: Selection;
  autocompleteQuery: string;
  autocompleteSuggestions: AutoCompleteSuggestions;
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
    const hasPostText = parent.postText.length > 0;
    const postTextTooLong = parent.postText.length > MAX_MESSAGE_TEXT_SIZE;
    return {
      enabled: parent.previewing
        ? hasPostText && !postTextTooLong
        : hasPostText,
      previewing: parent.previewing,
      isReply: !!parent.root,
      postTextTooLong,
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

export function textUnderMaximumLength(state: State): boolean {
  return state.postText.length <= MAX_MESSAGE_TEXT_SIZE;
}

function parseAutocompletable(
  postText: string,
  selection: Selection,
): {type: Suggestion['type']; value: string} | null {
  if (selection.start !== selection.end) return null;
  const cursor = selection.start;

  let startOfLabel = -1;
  for (let i = cursor - 1; i >= 0; i--) {
    const char = postText[i];
    if (/^\s$/.test(char)) return null;
    if (char === '#' || char === '@') {
      startOfLabel = i + 1;
      break;
    }
  }
  if (startOfLabel < 0) return null;

  let endOfLabel = cursor;
  for (let i = cursor; i < postText.length; i++) {
    const char = postText[i];
    endOfLabel = i;
    if (/^\s$/.test(char)) {
      break;
    }
  }

  const prefix = postText[startOfLabel - 1] as '@' | '#';
  const value = postText.slice(startOfLabel, endOfLabel);

  return {
    type: prefix === '#' ? 'hashtag' : 'mention',
    value,
  };
}

function getConsecutiveNewlineCount(text: string, from: 'start' | 'end') {
  const match = (from === 'start' ? /^(\n)+/g : /(\n)+$/g).exec(text);
  if (!match) return 0;
  return match[0].length;
}

function insertToPostText(
  postText: string,
  textToInsert: string,
  selection: {start: number; end: number},
) {
  const textBeforeSelection = postText.slice(0, selection.start);
  const textAfterSelection = postText.slice(selection.end);

  const consecutiveNewlinesBeforeSelection = getConsecutiveNewlineCount(
    textBeforeSelection,
    'end',
  );

  const insertedPrefix =
    textBeforeSelection.length === 0 || consecutiveNewlinesBeforeSelection > 1
      ? ''
      : consecutiveNewlinesBeforeSelection === 1
      ? '\n'
      : '\n\n';

  const consecutiveNewlinesAfterSelection = getConsecutiveNewlineCount(
    textAfterSelection,
    'start',
  );

  const insertedSuffix =
    consecutiveNewlinesAfterSelection > 1
      ? ''
      : consecutiveNewlinesAfterSelection === 1
      ? '\n'
      : '\n\n';

  const newTextBefore = textBeforeSelection + insertedPrefix;
  const newTextAfter = insertedSuffix + textAfterSelection;

  const newSelectionPosition = newTextBefore.length + textToInsert.length + 2;

  return {
    postText: newTextBefore + textToInsert + newTextAfter,
    selection: {
      start: newSelectionPosition,
      end: newSelectionPosition,
    },
  };
}

export interface Actions {
  updatePostText$: Stream<string>;
  updateSelection$: Stream<Selection>;
  chooseSuggestion$: Stream<
    {type: 'mention'; id: FeedId} | {type: 'hashtag'; id: string}
  >;
  cancelSuggestion$: Stream<any>;
  updateContentWarning$: Stream<string>;
  toggleContentWarningPreview$: Stream<any>;
  disablePreview$: Stream<any>;
  enablePreview$: Stream<any>;
  addAudio$: Stream<AudioBlobComposed>;
  attachAudio$: Stream<FileLite>;
  addPictureWithCaption$: Stream<{caption: string; image: FileLite}>;
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
          autocompleteQuery: '',
          autocompleteSuggestions: [],
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

  const updatePostTextSelectionReducer$ = actions.updateSelection$.map(
    (selection) =>
      function updatePostTextSelectionReducer(prev: State): State {
        return {...prev, postTextSelection: selection};
      },
  );

  const selectionAndState$ = actions.updateSelection$
    .compose(sampleCombine(state$))
    .compose(debounce(100));

  const openSuggestionsReducer$ = selectionAndState$
    .map<
      Stream<{
        selection: Selection;
        suggestions: State['autocompleteSuggestions'];
        query: NonNullable<ReturnType<typeof parseAutocompletable>>;
      }>
    >(([selection, state]) => {
      const query = parseAutocompletable(state.postText, selection);

      switch (query?.type ?? 'none') {
        case 'hashtag':
          return ssbSource
            .getHashtagsMatching(query!.value)
            .map((suggestions) => ({
              selection,
              suggestions,
              query: query!,
            }));

        case 'mention':
          return ssbSource
            .getMentionSuggestions(query!.value, state.authors)
            .map((suggestions) => ({
              selection,
              suggestions,
              query: query!,
            }));

        case 'none':
          return xs.never();
      }
    })
    .flatten()
    .map(
      ({selection: prevSelection, suggestions, query}) =>
        function openAutocompleteSuggestionsReducer(prev: State): State {
          const queryValue =
            (query.type === 'hashtag' ? '#' : '@') + query.value;

          const cursor = prevSelection.start;

          return {
            ...prev,
            postTextSelection: {
              start: cursor,
              end: cursor,
            },
            autocompleteQuery: queryValue,
            autocompleteSuggestions:
              suggestions.length > 0
                ? suggestions.slice(0, MAX_SUGGESTIONS)
                : suggestions,
          };
        },
    );

  const ignoreMentionSuggestionsReducer$ = selectionAndState$.map(
    ([selection, state]) =>
      function ignoreMentionSuggestionsReducer(prev: State): State {
        const autocompleteQuery = parseAutocompletable(
          state.postText,
          selection,
        );
        if (!autocompleteQuery && prev.autocompleteSuggestions.length > 0) {
          return {...prev, autocompleteSuggestions: []};
        } else {
          return prev;
        }
      },
  );

  const chooseSuggestionReducer$ = actions.chooseSuggestion$.map(
    (chosenOption) =>
      function chooseSuggestionReducer(prev: State): State {
        // Have to cast this way because of TS limitation
        // https://github.com/microsoft/TypeScript/issues/52028
        const chosen = (
          prev.autocompleteSuggestions as Array<
            HashtagSuggestion | MentionSuggestion
          >
        ).find((x) => {
          if (x.type !== chosenOption.type) return false;
          else return x.id === chosenOption.id;
        });
        if (!chosen) return prev;

        const cursor = prev.postTextSelection.start;

        // Represents index preceding the identifier of interest ('@' or '#')
        const beforeTargetIndex = prev.postText.lastIndexOf(
          prev.autocompleteQuery,
          cursor - 1,
        );

        const textBeforeTarget = prev.postText.substring(0, beforeTargetIndex);

        const textAfterTarget = prev.postText.substring(
          beforeTargetIndex + prev.autocompleteQuery.length,
        );

        const hasSpaceAfterTarget = textAfterTarget[0] === ' ';

        const autocompletable =
          chosen.type === 'mention'
            ? `[@${chosen.name}](${chosen.id})`
            : `#${chosen.id}`;

        const insertedValue =
          autocompletable + (hasSpaceAfterTarget ? '' : ' ');

        const postText = textBeforeTarget + insertedValue + textAfterTarget;

        const newSelectionPosition = Math.min(
          postText.length,
          beforeTargetIndex + autocompletable.length + 1,
        );

        const postTextSelection = {
          start: newSelectionPosition,
          end: newSelectionPosition,
        };

        return {
          ...prev,
          postText,
          postTextOverride: postText,
          postTextSelection,
          autocompleteQuery: '',
          autocompleteSuggestions: [],
        };
      },
  );

  const cancelSuggestionReducer$ = actions.cancelSuggestion$.mapTo(
    function cancelSuggestionReducer(prev: State): State {
      return {
        ...prev,
        autocompleteQuery: '',
        autocompleteSuggestions: [],
      };
    },
  );

  const addPictureReducer$ = actions.addPictureWithCaption$
    .map(({caption, image}) => {
      // Workaround a limitation in Playwright so that our e2e tests can work.
      // https://github.com/microsoft/playwright/issues/16846
      const imgPath = image.path || (image as any)._e2eTestPath;

      return ssbSource.addBlobFromPath$(imgPath.replace('file://', '')).map(
        (blobId) =>
          function addPictureReducer(prev: State): State {
            const imgMarkdown = `![${caption ?? 'image'}](${blobId})`;

            const {postText, selection} = insertToPostText(
              prev.postText,
              imgMarkdown,
              prev.postTextSelection,
            );

            return {
              ...prev,
              postText,
              postTextOverride: postText,
              postTextSelection: selection,
            };
          },
      );
    })
    .flatten();

  const addAudioReducer$ = actions.addAudio$.map(
    (audio) =>
      function addAudioReducer(prev: State): State {
        const {ext, blobId} = audio;

        const audioMarkdown = `![audio:recording.${ext}](${blobId})`;

        const {postText, selection} = insertToPostText(
          prev.postText,
          audioMarkdown,
          prev.postTextSelection,
        );

        return {
          ...prev,
          postText,
          postTextOverride: postText,
          postTextSelection: selection,
        };
      },
  );

  const attachAudioReducer$ = actions.attachAudio$
    .map((file) =>
      ssbSource.addBlobFromPath$(file.path.replace('file://', '')).map(
        (blobId) =>
          function attachAudioReducer(prev: State): State {
            const audioMarkdown = `![audio:${file.name}](${blobId})`;
            const {postText, selection} = insertToPostText(
              prev.postText,
              audioMarkdown,
              prev.postTextSelection,
            );

            return {
              ...prev,
              postText,
              postTextOverride: postText,
              postTextSelection: selection,
            };
          },
      ),
    )
    .flatten();

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

  const toggleContentWarningPreviewReducer$ =
    actions.toggleContentWarningPreview$.mapTo(
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
      updatePostTextSelectionReducer$,
      openSuggestionsReducer$,
      ignoreMentionSuggestionsReducer$,
      chooseSuggestionReducer$,
      cancelSuggestionReducer$,
      addPictureReducer$,
      addAudioReducer$,
      attachAudioReducer$,
      updateContentWarningReducer$,
      enablePreviewReducer$,
      disablePreviewReducer$,
      toggleContentWarningPreviewReducer$,
      getComposeDraftReducer$,
    ),
  );
}
