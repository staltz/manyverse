/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
import {View, Text, ScrollView} from 'react-native';
import {ReactElement} from 'react';
import {h} from '@cycle/react';
import DrawerMenuItem from '../../components/DrawerMenuItem';
import {styles} from './styles';
import {State} from './model';

function renderName(name?: string) {
  const namelessStyle = !name ? styles.noAuthorName : null;
  return h(
    Text,
    {
      style: [styles.authorName, namelessStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
    },
    name || 'No name',
  );
}

export default function view(state$: Stream<State>): Stream<ReactElement<any>> {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      h(View, {style: styles.header}, [
        h(View, {style: styles.authorImage}),
        renderName(state.name),
        h(
          Text,
          {style: styles.authorId, numberOfLines: 1, ellipsizeMode: 'middle'},
          state.selfFeedId,
        ),
      ]),
      h(ScrollView, {style: null}, [
        h(DrawerMenuItem, {
          sel: 'self-profile',
          icon: 'account-box',
          text: 'My profile',
          accessible: true,
          accessibilityLabel: 'My Profile Menu Item',
        }),
        h(DrawerMenuItem, {
          sel: 'bug-report',
          icon: 'email',
          text: 'Email bug report',
          accessible: true,
          accessibilityLabel: 'Email bug report',
        }),
        h(DrawerMenuItem, {icon: 'database', text: 'Raw database'}),
        h(DrawerMenuItem, {
          sel: 'about',
          icon: 'information',
          text: 'About MMMMM',
          accessible: true,
          accessibilityLabel: 'About this app',
        }),
      ]),
    ]),
  );
}
