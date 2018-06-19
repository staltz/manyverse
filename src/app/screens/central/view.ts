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
import {View, Text, TouchableHighlight} from 'react-native';
import {h} from '@cycle/native-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IndicatorViewPager} from 'rn-viewpager';
import {Palette} from '../../global-styles/palette';
import {styles as globalStyles} from '../../global-styles/styles';
import BetterPagerTabIndicator from '../../components/BetterPagerTabIndicator';
import {styles, iconProps} from './styles';
import {State} from './model';
import {Screens} from '../..';

function tabTitle(tabIndex: number) {
  if (tabIndex === 0) return 'Feed';
  if (tabIndex === 1) return 'Sync';
  return '';
}

function renderHeader(state: State) {
  return h(View, {style: styles.header}, [
    h(
      TouchableHighlight,
      {
        selector: 'drawer-button',
        style: styles.headerIcon,
        accessible: true,
        accessibilityLabel: 'Drawer Button',
        underlayColor: Palette.brand.backgroundDarker,
      },
      [h(Icon, {...iconProps.headerIcon, name: 'menu'})],
    ),
    h(Text, {style: styles.headerTitle}, tabTitle(state.currentTab)),
  ]);
}

const iconData = {
  public: {
    name: 'bulletin-board',
    accessible: true,
    accessibilityLabel: 'Public Tab Button',
  },

  sync: {
    name: 'wan',
    accessible: true,
    accessibilityLabel: 'Sync Tab Button',
  },
};

function renderPublicIcon(numOfPublicUpdates: number) {
  return {
    normal: h(
      View,
      [
        numOfPublicUpdates > 0 ? h(View, {style: styles.updatesDot}) : null,
        h(Icon, {...iconProps.tab, ...iconData.public}),
      ] as any,
    ),

    selected: h(
      View,
      [
        numOfPublicUpdates > 0 ? h(View, {style: styles.updatesDot}) : null,
        h(Icon, {...iconProps.tabSelected, ...iconData.public}),
      ] as any,
    ),
  };
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
        selector: 'tabs',
        style: [globalStyles.noMargin, {elevation: 3}] as any,
        itemStyle: styles.tabItem,
        selectedItemStyle: styles.tabItemSelected,
        tabs: [
          renderPublicIcon(state.numOfPublicUpdates),
          {
            normal: h(Icon, {...iconProps.tab, ...iconData.sync}),
            selected: h(Icon, {...iconProps.tabSelected, ...iconData.sync}),
          },
        ],
      }),
    },
    [
      h(View, {style: styles.pageContainer}, [publicTabVDOM]),
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
        renderHeader(state),
        renderTabs(state, publicTabVDOM, metadataTabVDOM),
      ]),
    }));
}
