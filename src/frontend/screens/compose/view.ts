/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {View, TextInput, KeyboardAvoidingView} from 'react-native';
import {Palette} from '../../global-styles/palette';
import Markdown from '../../global-styles/markdown';
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
    .map(state => ({postText: state.postText, previewing: state.previewing}))
    .compose(
      dropRepeats(
        (s1, s2) =>
          s1.previewing === s2.previewing && s1.postText === s2.postText,
      ),
    )
    .startWith({postText: '', previewing: false});

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
            h(Avatar, {
              size: avatarSize,
              style: styles.avatar,
              url: avatarUrl,
            }),

            miniState.previewing
              ? h(View, {style: styles.composePreview}, [
                  Markdown(miniState.postText),
                ])
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
