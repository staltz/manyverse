/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {h} from '@cycle/react';
import {View, TextInput, KeyboardAvoidingView} from 'react-native';
import {styles, avatarSize} from './styles';
import {Palette} from '../../global-styles/palette';
import {ReactElement} from 'react';
import Avatar from '../../components/Avatar';
import {State} from './model';

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  const avatarUrl$ = state$
    .map(state => state.avatarUrl)
    .compose(dropRepeats())
    .startWith(undefined);

  return xs.combine(topBar$, avatarUrl$).map(([topBar, avatarUrl]) =>
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
          h(TextInput, {
            style: styles.composeInput,
            sel: 'composeInput',
            ['nativeID' as any]: 'FocusViewOnResume',
            accessible: true,
            accessibilityLabel: 'Compose Text Input',
            autoFocus: true,
            multiline: true,
            returnKeyType: 'done',
            placeholder: 'Write a public message',
            placeholderTextColor: Palette.brand.textVeryWeak,
            selectionColor: Palette.indigo3,
            underlineColorAndroid: Palette.brand.textBackground,
          }),
        ],
      ),
    ]),
  );
}
