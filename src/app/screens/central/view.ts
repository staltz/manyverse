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

function configureTabs(
  publicTab$: Stream<ReactElement<any>>,
  privateTab$: Stream<ReactElement<any>>,
  notificationsTab$: Stream<ReactElement<any>>,
  syncTab$: Stream<ReactElement<any>>,
  extraTab$: Stream<ReactElement<any>>,
) {
  return xs.combine(
    publicTab$,
    privateTab$,
    notificationsTab$,
    syncTab$,
    extraTab$,
  ).map(([publicTab, privateTab, notificationsTab, syncTab, extraTab]) => ([
    {
      id: 'public_tab',
      icon: 'bulletin-board',
      label: 'Public Tab',
      VDOM: publicTab,
    },
    {
      id: 'private_tab',
      icon: 'email-secure',
      label: 'Private Tab',
      VDOM: privateTab,
    },
    {
      id: 'notifications_tab',
      icon: 'numeric-0-box',
      label: 'Notifications Tab',
      VDOM: notificationsTab,
    },
    {
      id: 'sync_tab',
      icon: 'wan',
      label: 'Metadata Tab',
      VDOM: syncTab,
    },
    {
      id: 'extra_tab',
      icon: 'more',
      label: 'Extra Tab',
      VDOM: extraTab,
    },
  ]));
}

export default function view(
  state$: Stream<State>,
  publicTab$: Stream<ReactElement<any>>,
  privateTab$: Stream<ReactElement<any>>,
  notificationsTab$: Stream<ReactElement<any>>,
  syncTab$: Stream<ReactElement<any>>,
  extraTab$: Stream<ReactElement<any>>,
  ) {
    const tabs$ = configureTabs(
      publicTab$,
      privateTab$,
      notificationsTab$,
      syncTab$,
      extraTab$,
    );

    return xs
      .combine(
        state$,
        tabs$,
      )
      .map(([state, tabs]) => ({
        screen: 'mmmmm.Central',
        vdom: h(View, {style: styles.root}, [
          renderTabs(state, tabs),
        ]),
      }));
}
