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
import {IndicatorViewPager} from 'rn-viewpager';
import {Palette} from '../../global-styles/palette';
import {styles as globalStyles} from '../../global-styles/styles';
import BetterPagerTabIndicator from '../../components/BetterPagerTabIndicator';
import {styles, iconProps} from './styles';
import {State} from './model';
import {Screens} from '../..';

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

function renderTabs(
  state: State,
  publicTabVDOM: ReactElement<any>,
  metadataTabVDOM: ReactElement<any>,
) {
  return h(
    IndicatorViewPager,
    {
      style: [styles.indicatorViewPager, {flex: state.visible ? 1 : 0}],
      indicator: h(BetterPagerTabIndicator, {
        style: [globalStyles.noMargin, {elevation: 3}] as any,
        itemStyle: styles.tabItem,
        selectedItemStyle: styles.tabItemSelected,
        tabs: [
          {
            normal: h(
              Icon,
              {
                ...iconProps.tab,
                name: 'bulletin-board',
                nativeID: 'testid_public_tab',
                accessible: true,
                accessibilityLabel: 'Public Tab Button',
              } as any,
            ),
            selected: h(
              Icon,
              {
                ...iconProps.tabSelected,
                name: 'bulletin-board',
                nativeID: 'testid_public_tab',
                accessible: true,
                accessibilityLabel: 'Public Tab Button',
              } as any,
            ),
          },
          {
            normal: h(
              Icon,
              {
                ...iconProps.tab,
                name: 'email-secure',
                accessible: true,
                accessibilityLabel: 'Private Tab Button',
              } as any,
            ),
            selected: h(
              Icon,
              {
                ...iconProps.tabSelected,
                name: 'email-secure',
                accessible: true,
                accessibilityLabel: 'Private Tab Button',
              } as any,
            ),
          },
          {
            normal: h(
              Icon,
              {
                ...iconProps.tab,
                name: 'numeric-0-box',
                accessible: true,
                accessibilityLabel: 'Notifications Tab Button',
              } as any,
            ),
            selected: h(
              Icon,
              {
                ...iconProps.tabSelected,
                name: 'numeric-0-box',
                accessible: true,
                accessibilityLabel: 'Notifications Tab Button',
              } as any,
            ),
          },
          {
            normal: h(
              Icon,
              {
                ...iconProps.tab,
                name: 'wan',
                accessible: true,
                accessibilityLabel: 'Sync Tab Button',
              } as any,
            ),
            selected: h(
              Icon,
              {
                ...iconProps.tabSelected,
                name: 'wan',
                accessible: true,
                accessibilityLabel: 'Sync Tab Button',
              } as any,
            ),
          },
        ],
      }),
    },
    [
      h(View, {style: styles.pageContainer}, [publicTabVDOM]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Private'),
      ]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Notifications'),
      ]),
      h(View, {style: styles.pageContainer}, [metadataTabVDOM]),
    ],
  );
}

export default function view(
  state$: Stream<State>,
  publicTabVDOM$: Stream<ReactElement<any>>,
  metadataTabVDOM$: Stream<ReactElement<any>>,
) {
  return xs
    .combine(
      state$,
      publicTabVDOM$.startWith(h(View)),
      metadataTabVDOM$.startWith(h(View)),
    )
    .map(([state, publicTabVDOM, metadataTabVDOM]) => ({
      screen: Screens.Central,
      vdom: h(View, {style: styles.root}, [
        renderHeader(),
        renderTabs(state, publicTabVDOM, metadataTabVDOM),
      ]),
    }));
}
