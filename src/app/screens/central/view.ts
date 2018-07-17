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
import dropRepeats from 'xstream/extra/dropRepeats';
import {ReactElement} from 'react';
import {View} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IndicatorViewPager} from 'rn-viewpager';
import {Palette} from '../../global-styles/palette';
import {styles as globalStyles} from '../../global-styles/styles';
import BetterPagerTabIndicator from '../../components/BetterPagerTabIndicator';
import {styles, iconProps, topBarTitle} from './styles';
import {State} from './model';
import {Dimensions} from '../../global-styles/dimens';

function tabTitle(tabIndex: number) {
  if (tabIndex === 0) return 'Messages';
  if (tabIndex === 1) return 'Sync';
  return '';
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
      style: styles.indicatorViewPager,
      indicator: h(BetterPagerTabIndicator, {
        sel: 'tabs',
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
    .map(([state, publicTabVDOM, metadataTabVDOM]) =>
      h(View, {style: styles.root}, [
        renderTabs(state, publicTabVDOM, metadataTabVDOM),
      ]),
    );
}

export function navOpts(state$: Stream<State>) {
  return state$
    .compose(dropRepeats((s1, s2) => s1.currentTab === s2.currentTab))
    .map(state => ({
      topBar: {
        visible: true,
        drawBehind: false,
        hideOnScroll: false,
        animate: false,
        borderHeight: 0,
        elevation: 0,
        height: Dimensions.toolbarAndroidHeight,
        buttonColor: 'white',
        background: {
          color: Palette.brand.background,
        },
        title: {
          ...topBarTitle,
          text: tabTitle(state.currentTab),
        },
        leftButtons: [
          {
            id: 'menu',
            icon: require('../../../../images/icon-menu.png'),
            title: 'Menu',
            color: Palette.white,
          },
        ],
      },
    }));
}
