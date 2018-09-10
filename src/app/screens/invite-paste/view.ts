/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
            selectionColor: Palette.indigo3,
            underlineColorAndroid: Palette.brand.textBackground,
          }),
        ],
      ),
    ]),
  );
}
