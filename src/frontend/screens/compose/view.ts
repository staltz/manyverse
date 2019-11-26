/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import pairwise from 'xstream/extra/pairwise';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import {propifyMethods} from 'react-propify-methods';
import {Palette} from '../../global-styles/palette';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import {State} from './model';
import {styles, avatarSize} from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '../../global-styles/dimens';
import AccountsList from '../../components/AccountsList';
const FocusableTextInput = propifyMethods(TextInput, 'focus' as any);

type MiniState = Pick<State, 'postText'> &
  Pick<State, 'postTextSelection'> &
  Pick<State, 'mentionQuery'> &
  Pick<State, 'mentionSuggestions'> &
  Pick<State, 'mentionChoiceTimestamp'> &
  Pick<State, 'contentWarning'> &
  Pick<State, 'previewing'>;

function ContentWarningButton(miniState: MiniState) {
  const style = miniState.contentWarning
    ? styles.contentWarningOn
    : styles.contentWarningOff;

  return h(
    TouchableOpacity,
    {
      sel: 'content-warning',
      activeOpacity: 0.4,
      accessible: true,
      accessibilityLabel: 'Content Warning Button',
    },
    [h(View, [h(Text, {style}, 'CW')])],
  );
}

function OpenCameraButton() {
  return h(
    TouchableOpacity,
    {
      sel: 'open-camera',
      style: styles.addPictureContainer,
      activeOpacity: 0.4,
      accessible: true,
      accessibilityLabel: 'Open Camera Button',
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.foregroundNeutral,
        name: 'camera',
      }),
    ],
  );
}

function AddPictureButton() {
  return h(
    TouchableOpacity,
    {
      sel: 'add-picture',
      style: styles.addPictureContainer,
      activeOpacity: 0.4,
      accessible: true,
      accessibilityLabel: 'Add Picture Button',
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.foregroundNeutral,
        name: 'image',
      }),
    ],
  );
}

function MarkdownPreview(state: MiniState) {
  return h(
    ScrollView,
    {
      style: styles.composePreview,
      contentContainerStyle: styles.previewContentContainer,
    },
    [Markdown(state.postText)],
  );
}

function maybeSelectionProp(state: MiniState): keyof TextInputProps {
  if (Date.now() < state.mentionChoiceTimestamp + 200) {
    return 'selection';
  } else {
    return 'doNotApplySelection' as any;
  }
}

function MarkdownInput(state: MiniState, focus$: Stream<undefined>) {
  return h(FocusableTextInput, {
    style: styles.composeInput,
    sel: 'composeInput',
    nativeID: 'FocusViewOnResume',
    focus$,
    value: state.postText,
    [maybeSelectionProp(state)]: state.postTextSelection,
    accessible: true,
    accessibilityLabel: 'Compose Text Input',
    autoFocus: true,
    multiline: true,
    returnKeyType: 'done',
    placeholder: 'Write a public message',
    placeholderTextColor: Palette.textVeryWeak,
    selectionColor: Palette.backgroundTextSelection,
    underlineColorAndroid: Palette.backgroundText,
  });
}

function MentionSuggestions(state: MiniState, focus$: Stream<undefined>) {
  return h(View, {style: styles.mentionsOverlay}, [
    h(View, {style: styles.mentionsInputContainer}, [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        style: styles.mentionsIcon,
        color: Palette.textVeryWeak,
        name: 'account-search',
      }),
      h(FocusableTextInput, {
        style: styles.mentionsInput,
        sel: 'mentionInput',
        value: state.mentionQuery,
        focus$,
        accessible: true,
        accessibilityLabel: 'Mention Account Text Input',
        multiline: false,
        returnKeyType: 'done',
        selectionColor: Palette.backgroundTextSelection,
        underlineColorAndroid: Palette.textLine,
      }),
      h(
        TouchableOpacity,
        {
          sel: 'mentions-cancel',
          style: styles.mentionsCancelButton,
          activeOpacity: 0.2,
          accessible: true,
          accessibilityLabel: 'Cancel Button',
        },
        [h(Text, {style: styles.mentionsCancelText}, 'Cancel')],
      ),
    ]),

    h(
      ScrollView,
      {style: styles.mentionsList, keyboardShouldPersistTaps: 'always'},
      [
        h(AccountsList, {
          sel: 'suggestions',
          accounts: state.mentionSuggestions as any,
        }),
      ],
    ),
  ]);
}

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  const avatarUrl$ = state$
    .map(state => state.avatarUrl)
    .compose(dropRepeats())
    .startWith(undefined);

  const miniState$ = (state$ as Stream<MiniState>)
    .compose(
      dropRepeats<MiniState>(
        (s1, s2) =>
          s1.previewing === s2.previewing &&
          s1.postText === s2.postText &&
          s1.postTextSelection === s2.postTextSelection &&
          s1.contentWarning === s2.contentWarning &&
          s1.mentionQuery === s2.mentionQuery &&
          s1.mentionSuggestions === s2.mentionSuggestions &&
          s1.mentionChoiceTimestamp === s2.mentionChoiceTimestamp,
      ),
    )
    .startWith({
      postText: '',
      postTextSelection: {start: 0, end: 0},
      previewing: false,
      contentWarning: '',
      mentionQuery: '',
      mentionSuggestions: [],
      mentionChoiceTimestamp: 0,
    });

  const mentionQueryPairwise$ = miniState$
    .map(s => s.mentionQuery)
    .compose(pairwise);

  const focusMarkdownInput$ = mentionQueryPairwise$
    .filter(([prev, curr]) => !!prev && !curr)
    .mapTo(void 0);

  const focusMentionQuery$ = mentionQueryPairwise$
    .filter(([prev, curr]) => !prev && !!curr)
    .mapTo(void 0);

  return xs
    .combine(topBar$, avatarUrl$, miniState$)
    .map(([topBar, avatarUrl, state]) =>
      h(View, {style: styles.container}, [
        topBar,
        h(KeyboardAvoidingView, {style: styles.bodyContainer, enabled: true}, [
          h(View, {style: styles.leftSide}, [
            h(Avatar, {size: avatarSize, url: avatarUrl}),
            h(View, {style: styles.leftSpacer}),
            OpenCameraButton(),
            AddPictureButton(),
            ContentWarningButton(state),
          ]),

          state.previewing
            ? MarkdownPreview(state)
            : MarkdownInput(state, focusMarkdownInput$),

          state.mentionSuggestions.length || state.mentionQuery
            ? MentionSuggestions(state, focusMentionQuery$)
            : null,
        ]),
      ]),
    );
}
