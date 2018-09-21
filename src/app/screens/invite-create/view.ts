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
import {h} from '@cycle/react';
import {View, Text} from 'react-native';
import {styles} from './styles';
import {Palette} from '../../global-styles/palette';
import {ReactElement} from 'react';
import {State} from './model';

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  return xs.combine(state$, topBar$).map(([state, topBar]) =>
    h(View, {style: styles.container}, [
      topBar,
      h(View, {style: styles.bodyContainer}, [
        h(Text, {style: styles.about, textBreakStrategy: 'simple'}, [
          'GIVE THIS INVITE CODE TO ' as any,
          h(Text, {style: styles.bold}, 'ONE'),
          ' FRIEND' as any,
        ]),
        h(
          Text,
          {
            style: styles.inviteCode,
            accessible: true,
            accessibilityLabel: 'Invite Code',
            selectable: true,
            selectionColor: Palette.indigo3,
          },
          state.inviteCode || 'loading...',
        ),
        h(Text, {style: styles.about, textBreakStrategy: 'simple'}, [
          'YOU WILL SYNC WHEN YOU ARE ' as any,
          h(Text, {style: styles.bold}, 'BOTH'),
          ' ONLINE' as any,
        ]),
      ]),
    ]),
  );
}
