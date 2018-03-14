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

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {h} from '@cycle/native-screen';
import {View, Text, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationList, {NavigationListItem} from '../../../components/NavigationList';
import {styles, iconProps} from './styles';

export function basicIcon(iconName: string) {
  return h(Icon, {...iconProps.rowIcon, name: iconName});
}

export default function view(items$: Stream<Array<NavigationListItem>>) {
  return items$.map(items =>
    h(NavigationList, {
      items: items,
    }),
  );
}
