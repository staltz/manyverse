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
import {View, Text} from 'react-native';
import {h} from '@cycle/native-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IndicatorViewPager} from 'rn-viewpager';
import {Palette} from '../../../global-styles/palette';
import {styles as globalStyles} from '../../../global-styles/styles';
import BetterPagerTabIndicator from '../../../components/BetterPagerTabIndicator';
import {styles, iconProps} from './styles';
import {State} from '../model';

export type Tab = {
  id: string,
  icon: string,
  label: string,
  VDOM: ReactElement<any>,
}

export function renderTabs(
  state: State,
  tabs: Array<Tab>,
) {
  const tabsForPager = tabs.map(
    tab => createTabDescriptor(tab.id, tab.icon, tab.label)
  );
  const tabDOMsForPager = tabs.map(
    tab => h(View, {style: styles.pageContainer}, [tab.VDOM])
  );

  return h(
    IndicatorViewPager,
    {
      style: [styles.indicatorViewPager, {flex: state.visible ? 1 : 0}],
      indicator: h(BetterPagerTabIndicator, {
        style: [globalStyles.noMargin, {elevation: 3}] as any,
        itemStyle: styles.tabItem,
        selectedItemStyle: styles.tabItemSelected,
        tabs: tabsForPager,
      }),
    },
    tabDOMsForPager,
  );
}

function createTabDescriptor(
  id: string,
  icon: string,
  label: string,
) {
  return {
    normal: h(
      Icon,
      {
        ...iconProps.tab,
        name: icon,
        nativeID: 'normal_' + id,
        accessible: true,
        accessibilityLabel: label,
      } as any,
    ),
    selected: h(
      Icon,
      {
        ...iconProps.tabSelected,
        name: icon,
        nativeID: 'selected_' + id,
        accessible: true,
        accessibilityLabel: label,
      } as any,
    ),
  };
}
