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

import xs, {Stream} from 'xstream';
import {PureComponent} from 'react';
import {View, FlatList, Text, TouchableHighlight} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../global-styles/palette';
import Message from '../components/Message';
import {Msg} from '../types';

export default function view(feed$: Stream<Msg>) {
  const vdom$ = feed$
    .fold((arr, msg) => arr.concat(msg), [] as Array<Msg>)
    .map(arr => arr.slice().reverse())
    .map(feed =>
      h(FlatList, {
        data: feed,
        keyExtractor: (item: any, index: number) => item.key || String(index),
        renderItem: ({item}: {item: Msg}) => h(Message, {msg: item})
      })
    );

  return vdom$;
}
