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

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  const avatarUrl$ = state$
    .map(state => state.avatarUrl)
    .compose(dropRepeats())
    .startWith(undefined);

  const miniState$ = state$
    .map(state => ({
      postText: state.postText,
      previewing: state.previewing,
      contentWarning: state.contentWarning,
    }))
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
        h(
          KeyboardAvoidingView,
          {
            style: styles.bodyContainer,
            ['enabled' as any]: true,
          },
          [
            h(View, {style: styles.leftSide}, [
              h(Avatar, {
                size: avatarSize,
                url: avatarUrl,
              }),
              h(View, {style: styles.leftSpacer}),
              h(
                TouchableOpacity,
                {
                  sel: 'content-warning',
                  activeOpacity: 0.4,
                  accessible: true,
                  accessibilityLabel: 'Content Warning Button',
                },
                [
                  h(View, [
                    h(
                      Text,
                      {
                        style: miniState.contentWarning
                          ? styles.contentWarningOn
                          : styles.contentWarningOff,
                      },
                      'CW',
                    ),
                  ]),
                ],
              ),
            ]),

            miniState.previewing
              ? h(
                  ScrollView,
                  {
                    style: styles.composePreview,
                    contentContainerStyle: styles.previewContentContainer,
                  },
                  [Markdown(miniState.postText)],
                )
              : h(TextInput, {
                  style: styles.composeInput,
                  sel: 'composeInput',
                  ['nativeID' as any]: 'FocusViewOnResume',
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
                }),
          ],
        ),
      ]),
    );
}
