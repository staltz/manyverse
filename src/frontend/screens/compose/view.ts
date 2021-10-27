// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
  MenuProvider,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {displayName} from '../../ssb/utils/from-ssb';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import SettableTextInput from '../../components/SettableTextInput';
import LocalizedHumanTime from '../../components/LocalizedHumanTime';
import ContentWarning from '../../components/messages/ContentWarning';
import {State} from './model';
import {styles, avatarSize} from './styles';
import AccountSmall from '../../components/AccountSmall';

type MiniState = Pick<State, 'postText'> &
  Pick<State, 'postTextOverride'> &
  Pick<State, 'postTextSelection'> &
  Pick<State, 'selfAvatarUrl'> &
  Pick<State, 'selfFeedId'> &
  Pick<State, 'selfName'> &
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
  const button = h(
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

  if (Platform.OS === 'web') {
    return h(View, [
      h('label', {htmlFor: 'add_picture_desktop'}, [button]),
      h('input', {
        sel: 'add-picture-desktop',
        id: 'add_picture_desktop',
        type: 'file',
        accept: 'image/png, image/jpeg',
        style: {display: 'none'},
        multiple: false,
      }),
    ]);
  } else {
    return button;
  }
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

function MentionSuggestions(state: MiniState) {
  return h(
    Menu,
    {
      sel: 'mentions-menu',
      renderer: renderers.SlideInMenu,
      opened: !state.previewing && state.mentionSuggestions.length > 0,
    },
    [
      h(MenuTrigger, {disabled: true}),
      h(
        MenuOptions,
        {customStyles: {optionsContainer: styles.menuOptions}},
        state.mentionSuggestions.map(({id, name, imageUrl}) =>
          h(MenuOption, {
            value: id,
            customStyles: {
              optionWrapper: styles.menuOptionWrapper,
              optionTouchable: styles.menuOptionTouchable,
            },
            ['children' as any]: h(AccountSmall, {id, name, imageUrl}),
          }),
        ),
      ),
    ],
  );
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
      selfFeedId: '',
      selfName: undefined,
      mentionSuggestions: [],
      mentionChoiceTimestamp: 0,
    });

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
          h(MenuProvider, {customStyles: {backdrop: styles.menuBackdrop}}, [
            h(
              ScrollView,
              {
                style: styles.scroll,
                contentContainerStyle: styles.scrollContent,
              },
              [
                Header(state),
                state.previewing
                  ? MarkdownPreview(state)
                  : h(MarkdownInput, {
                      nativeProps$: setMarkdownInputNativeProps$,
                    }),
              ],
            ),

            MentionSuggestions(state),

            state.previewing
              ? null
              : h(View, {style: styles.footerContainer}, [
                  RecordAudioButton(),
                  Platform.OS === 'web' ? null : OpenCameraButton(),
                  AddPictureButton(),
                  ContentWarningButton(state),
                ]),
          ]),
        ],
      ),
    ]),
  );
}
