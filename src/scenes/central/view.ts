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
import {PagerTabIndicator, IndicatorViewPager} from 'rn-viewpager';
import {Palette} from '../../global-styles/palette';
import {Dimensions as Dimens} from '../../global-styles/dimens';
import {styles as globalStyles} from '../../global-styles/styles';
import BetterPagerTabIndicator from '../../components/BetterPagerTabIndicator';
import {styles, iconProps} from './styles';

function renderHeader() {
  return h(View, {style: styles.header}, [
    h(TouchableHighlight, {style: styles.headerIcon}, [
      h(Icon, {...iconProps.headerIcon, name: 'menu'})
    ]),
    h(TextInput, {
      underlineColorAndroid: Palette.brand.backgroundLighterContrast,
      placeholderTextColor: Palette.brand.backgroundLighterContrast,
      placeholder: 'Search',
      returnKeyType: 'search',
      style: styles.searchInput
    }),
    h(
      TouchableHighlight,
      {
        selector: 'self-profile',
        style: styles.headerIcon,
        underlayColor: Palette.brand.backgroundDarker
      },
      [h(Icon, {...iconProps.headerIcon, name: 'account-box'})]
    )
  ]);
}

function renderTabs(
  publicTabVDOM: ReactElement<any>,
  metadataTabVDOM: ReactElement<any>
) {
  return h(
    IndicatorViewPager,
    {
      style: styles.indicatorViewPager,
      indicator: h(BetterPagerTabIndicator, {
        style: [globalStyles.noMargin, {elevation: 3}] as any,
        itemStyle: styles.tabItem,
        selectedItemStyle: styles.tabItemSelected,
        tabs: [
          {
            normal: h(Icon, {...iconProps.tab, name: 'bulletin-board'}),
            selected: h(Icon, {
              ...iconProps.tabSelected,
              name: 'bulletin-board'
            })
          },
          {
            normal: h(Icon, {...iconProps.tab, name: 'email-secure'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'email-secure'})
          },
          {
            normal: h(Icon, {...iconProps.tab, name: 'numeric-0-box'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'numeric-0-box'})
          },
          {
            normal: h(Icon, {...iconProps.tab, name: 'wan'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'wan'})
          }
        ]
      })
    },
    [
      h(View, {style: styles.pageContainer}, [publicTabVDOM]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Private')
      ]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Notifications')
      ]),
      h(View, {style: styles.pageContainer}, [metadataTabVDOM])
    ]
  );
}

export default function view(
  publicTabVDOM$: Stream<ReactElement<any>>,
  metadataTabVDOM$: Stream<ReactElement<any>>
) {
  return xs
    .combine(
      publicTabVDOM$.startWith(h(View)),
      metadataTabVDOM$.startWith(h(View))
    )
    .map(([publicTabVDOM, metadataTabVDOM]) => ({
      screen: 'mmmmm.Central',
      vdom: h(View, {style: styles.root}, [
        renderHeader(),
        renderTabs(publicTabVDOM, metadataTabVDOM)
      ])
    }));
}
