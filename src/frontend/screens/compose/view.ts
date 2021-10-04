/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import pairwise from 'xstream/extra/pairwise';
import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {propifyMethods} from 'react-propify-methods';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {displayName} from '../../ssb/utils/from-ssb';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import AccountsList from '../../components/AccountsList';
import SettableTextInput from '../../components/SettableTextInput';
import LocalizedHumanTime from '../../components/LocalizedHumanTime';
import ContentWarning from '../../components/messages/ContentWarning';
import {State} from './model';
import {styles, avatarSize} from './styles';
const FocusableTextInput = propifyMethods(TextInput, 'focus' as any);

type MiniState = Pick<State, 'postText'> &
  Pick<State, 'postTextOverride'> &
  Pick<State, 'postTextSelection'> &
  Pick<State, 'selfAvatarUrl'> &
  Pick<State, 'selfFeedId'> &
  Pick<State, 'selfName'> &
  Pick<State, 'mentionQuery'> &
  Pick<State, 'mentionSuggestions'> &
  Pick<State, 'mentionChoiceTimestamp'> &
  Pick<State, 'contentWarning'> &
  Pick<State, 'contentWarningPreviewOpened'> &
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

function RecordAudioButton() {
  return h(
    TouchableOpacity,
    {
      sel: 'record-audio',
      style: styles.footerButtonContainer,
      activeOpacity: 0.4,
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: t(
        'compose.call_to_action.record_audio.accessibility_label',
      ),
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.textVeryWeak,
        name: 'microphone',
      }),
    ],
  );
}

function OpenCameraButton() {
  return h(
    TouchableOpacity,
    {
      sel: 'open-camera',
      style: styles.footerButtonContainer,
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
        color: Palette.textVeryWeak,
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
      style: styles.footerButtonContainer,
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
        color: Palette.textVeryWeak,
        name: 'image',
      }),
    ],
  );
}

function MarkdownPreview(state: MiniState) {
  return h(View, {style: styles.preview}, [
    state.contentWarning.length > 0
      ? h(ContentWarning, {
          sel: 'content-warning-preview',
          description: state.contentWarning,
          opened: state.contentWarningPreviewOpened,
          key: 'cw',
        })
      : null,

    state.contentWarningPreviewOpened
      ? h(Markdown, {text: state.postText})
      : null,
  ]);
}

class MarkdownInput extends PureComponent<
  {nativeProps$: Stream<any>},
  {height: number}
> {
  state = {height: 0};

  private onChange = (e: any) => {
    const height = e.target.scrollHeight;
    if (height - this.state.height > 5) {
      this.setState({height});
    }
  };

  private onLayout = (e: any) => {
    this.setState({height: e.nativeEvent.target.scrollHeight});
    const height = e.nativeEvent.target.scrollHeight;
    if (height - this.state.height > 5) {
      this.setState({height});
    }
  };

  public render() {
    const nativePropsAndFocus$ = this.props.nativeProps$;

    return h(SettableTextInput, {
      style: styles.composeInput,
      sel: 'composeInput',
      nativePropsAndFocus$,
      accessible: true,
      accessibilityLabel: t('compose.text_field.accessibility_label'),
      autoFocus: true,
      multiline: true,
      scrollEnabled: false,
      returnKeyType: 'done',
      placeholder: t('compose.text_field.placeholder'),
      placeholderTextColor: Palette.textVeryWeak,
      selectionColor: Palette.backgroundTextSelection,
      ...Platform.select({
        android: {
          nativeID: 'FocusViewOnResume',
          underlineColorAndroid: Palette.backgroundText,
        },
        web: {
          style: [
            styles.composeInput,
            {minHeight: `max(${this.state.height}px, 60vh)`},
          ],
          onLayout: this.onLayout,
          onChange: this.onChange,
        },
      }),
    });
  }
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
        defaultValue: state.mentionQuery,
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

function Header(state: MiniState) {
  return h(View, {style: styles.headerContainer}, [
    h(Avatar, {
      size: avatarSize,
      url: state.selfAvatarUrl,
      style: styles.authorAvatar,
    }),
    h(
      Text,
      {
        key: 'b',
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      displayName(state.selfName, state.selfFeedId),
    ),
    h(Text, {key: 'c', style: styles.timestamp}, [
      h(LocalizedHumanTime, {time: Date.now() - 1}),
    ]),
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
        'postTextOverride',
        'postTextSelection',
        'previewing',
        'selfAvatarUrl',
        'selfFeedId',
        'selfName',
        'contentWarning',
        'contentWarningPreviewOpened',
        'mentionQuery',
        'mentionSuggestions',
        'mentionChoiceTimestamp',
      ]),
    )
    .startWith({
      postText: '',
      postTextOverride: '',
      postTextSelection: {start: 0, end: 0},
      previewing: false,
      contentWarning: '',
      contentWarningPreviewOpened: false,
      mentionQuery: '',
      selfFeedId: '',
      selfName: undefined,
      mentionSuggestions: [],
      mentionChoiceTimestamp: 0,
    });

  const mentionQueryPairwise$ = miniState$
    .map((s) => s.mentionQuery)
    .compose(pairwise);

  const focusMentionQuery$ = mentionQueryPairwise$
    .filter(([prev, curr]) => !prev && !!curr)
    .mapTo(void 0);

  const setMarkdownInputNativeProps$ = state$
    .compose(dropRepeatsByKeys(['postTextOverride']))
    .map((s) => ({
      focus: true,
      text: s.postTextOverride,
      selection: s.postTextSelection,
    }));

  return xs.combine(topBar$, miniState$).map(([topBar, state]) =>
    h(View, {style: styles.container}, [
      topBar,
      h(
        KeyboardAvoidingView,
        {
          style: styles.bodyContainer,
          enabled: true,
          ...Platform.select({ios: {behavior: 'padding' as const}}),
        },
        [
          h(
            ScrollView,
            {style: styles.scroll, contentContainerStyle: styles.scrollContent},
            [
              Header(state),
              state.previewing
                ? MarkdownPreview(state)
                : h(MarkdownInput, {
                    nativeProps$: setMarkdownInputNativeProps$,
                  }),
            ],
          ),

          state.mentionSuggestions.length || state.mentionQuery
            ? MentionSuggestions(state, focusMentionQuery$)
            : null,

          state.previewing
            ? null
            : h(View, {style: styles.footerContainer}, [
                RecordAudioButton(),
                OpenCameraButton(),
                AddPictureButton(),
                ContentWarningButton(state),
              ]),
        ],
      ),
    ]),
  );
}
