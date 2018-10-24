/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, TextInput, KeyboardAvoidingView} from 'react-native';
import {styles} from './styles';
import {Palette} from '../../global-styles/palette';
import {ReactElement} from 'react';

export default function view(topBar$: Stream<ReactElement<any>>) {
  return topBar$.map(topBar =>
    h(View, {style: styles.container}, [
      topBar,
      h(
        KeyboardAvoidingView,
        {
          style: styles.bodyContainer,
          ['enabled' as any]: true,
        },
        [
          h(TextInput, {
            style: styles.contentInput,
            sel: 'contentInput',
            ['nativeID' as any]: 'FocusViewOnResume',
            accessible: true,
            accessibilityLabel: 'Invite Text Input',
            autoFocus: true,
            multiline: true,
            returnKeyType: 'done',
            placeholder: 'Paste an invitation code',
            placeholderTextColor: Palette.brand.textVeryWeak,
            selectionColor: Palette.colors.indigo3,
            underlineColorAndroid: Palette.brand.textBackground,
          }),
        ],
      ),
    ]),
  );
}
