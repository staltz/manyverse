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
