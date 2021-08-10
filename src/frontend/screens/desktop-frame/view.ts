/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {View} from 'react-native';
import {styles} from './styles';
import {t} from '../../drivers/localization';
import PublicTabIcon from '../../components/tab-buttons/PublicTabIcon';
import PrivateTabIcon from '../../components/tab-buttons/PrivateTabIcon';
import ActivityTabIcon from '../../components/tab-buttons/ActivityTabIcon';
import ConnectionsTabIcon from '../../components/tab-buttons/ConnectionsTabIcon';
import TabIcon from '../../components/tab-buttons/TabIcon';
import Avatar from '../../components/Avatar';
import {Dimensions} from '../../global-styles/dimens';
import {State} from './model';

class TopBarStub extends PureComponent {
  public render() {
    return h(View, {style: styles.topBarStub});
  }
}

export default function view(
  state$: Stream<State>,
  children$: Stream<Array<ReactElement>>,
  localizationLoaded$: Stream<boolean>,
) {
  return xs
    .combine(state$, children$, localizationLoaded$.take(1))
    .map(([state, children]) =>
      h(View, {style: styles.screen}, [
        h(View, {style: styles.left}, [
          h(TopBarStub),

          h(View, {style: styles.leftMenu}, [
            h(PublicTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'public',
              numOfUpdates: 0,
            }),
            h(PrivateTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'private',
              numOfUpdates: 0,
            }),
            h(ActivityTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'activity',
              numOfUpdates: 0,
            }),
            h(ConnectionsTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'connections',
              offline: false,
              numConnected: 0,
              numStaged: 0,
            }),

            h(View, {style: styles.spacer}),

            h(TabIcon, {
              sel: 'more',
              iconName: 'dots-horizontal',
              label: t('drawer.menu.more.label'),
              accessibilityLabel: t('drawer.menu.more.accessibility_label'),
            }),
            h(TabIcon, {
              sel: 'settings',
              iconName: 'cog',
              label: t('drawer.menu.settings.label'),
              accessibilityLabel: t('drawer.menu.settings.accessibility_label'),
            }),
            h(TabIcon, {
              style: styles.myProfileButton,
              sel: 'self-profile',
              iconName: 'account-circle',
              label: state.name ?? t('drawer.menu.my_profile.label'),
              accessibilityLabel: t(
                'drawer.menu.my_profile.accessibility_label',
              ),
              renderIconExtras: () =>
                state.selfAvatarUrl
                  ? h(Avatar, {
                      style: styles.avatar,
                      size: Dimensions.iconSizeNormal,
                      url: state.selfAvatarUrl,
                    })
                  : null,
            }),
          ]),
        ]),

        h(View, {style: styles.centerAndRight}, [...children]),
      ]),
    );
}
