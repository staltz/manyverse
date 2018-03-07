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
import {ReactElement} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {h} from '@cycle/native-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../global-styles/palette';
import {styles as globalStyles} from '../../global-styles/styles';
import {styles, iconProps} from './styles';
import {State} from './model';
import {renderTabs, Tab} from './tabs/index';

function renderHeader() {
  return h(View, {style: styles.header}, [
    h(TouchableHighlight, {style: styles.headerIcon}, [
      h(Icon, {...iconProps.headerIcon, name: 'menu'}),
    ]),
    h(TextInput, {
      underlineColorAndroid: Palette.brand.backgroundLighterContrast,
      placeholderTextColor: Palette.brand.backgroundLighterContrast,
      placeholder: 'Search',
      returnKeyType: 'search',
      accessible: true,
      accessibilityLabel: 'Search Field',
      style: styles.searchInput,
    }),
    h(
      TouchableHighlight,
      {
        selector: 'self-profile',
        style: styles.headerIcon,
        accessible: true,
        accessibilityLabel: 'My Profile Button',
        underlayColor: Palette.brand.backgroundDarker,
      },
      [h(Icon, {...iconProps.headerIcon, name: 'account-box'})],
    ),
  ]);
}

export default function view(
  state$: Stream<State>,
  tabs$: Stream<Array<Tab>>,
) {
  return xs
    .combine(
      state$,
      tabs$,
    )
    .map(([state, tabs]) => ({
      screen: 'mmmmm.Central',
      vdom: h(View, {style: styles.root}, [
        renderHeader(),
        renderTabs(state, tabs),
      ]),
    }));
}
