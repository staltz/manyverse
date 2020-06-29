/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
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
  Platform,
} from 'react-native';
import {propifyMethods} from 'react-propify-methods';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import AccountsList from '../../components/AccountsList';
import {State} from './model';
import {styles, avatarSize} from './styles';
const FocusableTextInput = propifyMethods(TextInput, 'focus' as any);

type MiniState = Pick<State, 'postText'> &
  Pick<State, 'postTextSelection'> &
  Pick<State, 'selfAvatarUrl'> &
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
      accessibilityRole: 'button',
      accessibilityLabel: t(
        'compose.content_warning_initials.accessibility_label',
      ),
    },
    [
      h(View, {pointerEvents: 'box-only'}, [
        h(Text, {style}, t('compose.content_warning_initials.label')),
      ]),
    ],
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
      accessibilityRole: 'button',
      accessibilityLabel: t(
        'compose.call_to_action.open_camera.accessibility_label',
      ),
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
      accessibilityRole: 'button',
      accessibilityLabel: t(
        'compose.call_to_action.add_picture.accessibility_label',
      ),
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
    [h(Markdown, {text: state.postText})],
  );
}

function maybeSelectionProp(state: MiniState): keyof TextInputProps {
  // On iOS, the selection overriding is snappy and quick, no lag
  if (Platform.OS === 'ios') return 'selection';

  // On Android, we have to do this debounce hack...
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
    accessibilityLabel: t('compose.text_field.accessibility_label'),
    autoFocus: true,
    multiline: true,
    returnKeyType: 'done',
    placeholder: t('compose.text_field.placeholder'),
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
        accessibilityRole: 'search',
        accessibilityLabel: t('compose.mention_field.accessibility_label'),
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
          accessibilityRole: 'button',
          accessibilityLabel: t('call_to_action.cancel'),
        },
        [
          h(
            Text,
            {style: styles.mentionsCancelText},
            t('call_to_action.cancel'),
          ),
        ],
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
  const miniState$ = (state$ as Stream<MiniState>)
    .compose(
      dropRepeatsByKeys([
        'postText',
        'postTextSelection',
        'previewing',
        'selfAvatarUrl',
        'contentWarning',
        'mentionQuery',
        'mentionSuggestions',
        'mentionChoiceTimestamp',
      ]),
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

  const behaviorProp = Platform.OS === 'ios' ? 'behavior' : 'IGNOREbehavior';

  return xs.combine(topBar$, miniState$).map(([topBar, state]) =>
    h(View, {style: styles.container}, [
      topBar,
      h(
        KeyboardAvoidingView,
        {
          style: styles.bodyContainer,
          enabled: true,
          [behaviorProp]: 'padding',
        },
        [
          h(View, {style: styles.leftSide}, [
            h(Avatar, {size: avatarSize, url: state.selfAvatarUrl}),
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
        ],
      ),
    ]),
  );
}
