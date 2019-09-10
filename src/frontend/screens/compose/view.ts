/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {Palette} from '../../global-styles/palette';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/Avatar';
import {State} from './model';
import {styles, avatarSize} from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '../../global-styles/dimens';

type MiniState = Pick<State, 'postText'> &
  Pick<State, 'previewing'> &
  Pick<State, 'contentWarning'>;

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
      style: styles.addPictureContainer,
      activeOpacity: 0.4,
      accessible: true,
      accessibilityLabel: 'Add Picture Button',
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

function MarkdownPreview(miniState: MiniState) {
  return h(
    ScrollView,
    {
      style: styles.composePreview,
      contentContainerStyle: styles.previewContentContainer,
    },
    [Markdown(miniState.postText)],
  );
}

function MarkdownInput(miniState: MiniState) {
  return h(TextInput, {
    style: styles.composeInput,
    sel: 'composeInput',
    nativeID: 'FocusViewOnResume',
    value: miniState.postText,
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

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  const avatarUrl$ = state$
    .map(state => state.avatarUrl)
    .compose(dropRepeats())
    .startWith(undefined);

  const miniState$ = state$
    .map(
      state =>
        ({
          postText: state.postText,
          previewing: state.previewing,
          contentWarning: state.contentWarning,
        } as MiniState),
    )
    .compose(
      dropRepeats(
        (s1, s2) =>
          s1.previewing === s2.previewing &&
          s1.postText === s2.postText &&
          s1.contentWarning === s2.contentWarning,
      ),
    )
    .startWith({postText: '', previewing: false, contentWarning: ''});

  return xs
    .combine(topBar$, avatarUrl$, miniState$)
    .map(([topBar, avatarUrl, miniState]) =>
      h(View, {style: styles.container}, [
        topBar,
        h(KeyboardAvoidingView, {style: styles.bodyContainer, enabled: true}, [
          h(View, {style: styles.leftSide}, [
            h(Avatar, {size: avatarSize, url: avatarUrl}),
            h(View, {style: styles.leftSpacer}),
            OpenCameraButton(),
            AddPictureButton(),
            ContentWarningButton(miniState),
          ]),

          miniState.previewing
            ? MarkdownPreview(miniState)
            : MarkdownInput(miniState),
        ]),
      ]),
    );
}
