/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement, Fragment} from 'react';
import {
  View,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FloatingAction} from 'react-native-floating-action';
import {MenuProvider} from 'react-native-popup-menu';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {styles, iconProps} from './styles';
import {State} from './model';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const touchableProps = Platform.select<any>({
  android: {
    background: TouchableNativeFeedback.SelectableBackground(),
  },
  default: {},
});

function renderPublicIcon(isSelected: boolean, numOfPublicUpdates: number) {
  return h(
    Touchable,
    {
      ...touchableProps,
      sel: 'public-tab-button',
      style: styles.tabButton, // iOS needs this
      accessible: true,
      accessibilityLabel: 'Public Tab Button',
    },
    [
      h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
        h(View, [
          h(Icon, {
            name: 'bulletin-board',
            ...(isSelected ? iconProps.tabSelected : iconProps.tab),
          }),
          h(View, {
            style:
              numOfPublicUpdates > 10
                ? styles.updatesCoverNone
                : numOfPublicUpdates > 0
                ? styles.updatesCoverSome
                : styles.updatesCoverAll,
          }),
        ]),
      ]),
    ],
  );
}

function renderPrivateIcon(isSelected: boolean, numOfPrivateUpdates: number) {
  let iconName = isSelected ? 'message' : 'message-outline';
  if (numOfPrivateUpdates > 0) {
    iconName = isSelected ? 'message-text' : 'message-text-outline';
  }

  return h(
    Touchable,
    {
      ...touchableProps,
      sel: 'private-tab-button',
      style: styles.tabButton, // iOS needs this
      accessible: true,
      accessibilityLabel: 'Private Tab Button',
    },
    [
      h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
        h(View, [
          h(Icon, {
            name: iconName,
            ...(isSelected ? iconProps.tabSelected : iconProps.tab),
          }),
        ]),
      ]),
    ],
  );
}

function renderConnectionsIcon(
  isSelected: boolean,
  state: State['connectionsTab'],
) {
  let iconName = isSelected ? 'network-off' : 'network-off-outline';
  if (state?.bluetoothEnabled || state?.internetEnabled || state?.lanEnabled) {
    iconName = isSelected ? 'network' : 'network-outline';
  }
  if ((state?.peers || []).filter(p => p[1].state === 'connected').length > 0) {
    iconName = isSelected ? 'check-network' : 'check-network-outline';
  }

  return h(
    Touchable,
    {
      ...touchableProps,
      sel: 'connections-tab-button',
      style: styles.tabButton, // iOS needs this
      accessible: true,
      accessibilityLabel: 'Connections Tab Button',
    },
    [
      h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
        h(Icon, {
          name: iconName,
          ...(isSelected ? iconProps.tabSelected : iconProps.tab),
        }),
      ]),
    ],
  );
}

function renderTabPage(
  state: State,
  fabProps: FabProps,
  publicTabVDOM: ReactElement<any>,
  privateTabVDOM: ReactElement<any>,
  metadataTabVDOM: ReactElement<any>,
) {
  const shown = styles.pageShown;
  const hidden = styles.pageHidden;
  return h(Fragment, [
    h(View, {style: [state.currentTab === 'public' ? shown : hidden]}, [
      publicTabVDOM,
      h(FloatingAction, fabProps),
    ]),
    h(View, {style: [state.currentTab === 'private' ? shown : hidden]}, [
      privateTabVDOM,
      h(FloatingAction, fabProps),
    ]),
    h(View, {style: [state.currentTab === 'connections' ? shown : hidden]}, [
      metadataTabVDOM,
      h(FloatingAction, fabProps),
    ]),
  ]);
}

function renderTabBar(state: State) {
  const {currentTab, numOfPublicUpdates, numOfPrivateUpdates} = state;

  return h(View, {style: styles.tabBar}, [
    renderPublicIcon(currentTab === 'public', numOfPublicUpdates),
    renderPrivateIcon(currentTab === 'private', numOfPrivateUpdates),
    renderConnectionsIcon(currentTab === 'connections', state.connectionsTab),
  ]);
}

export default function view(
  state$: Stream<State>,
  fabProps$: Stream<FabProps>,
  topBar$: Stream<ReactElement<any>>,
  publicTab$: Stream<ReactElement<any>>,
  privateTab$: Stream<ReactElement<any>>,
  connectionsTab$: Stream<ReactElement<any>>,
) {
  return xs
    .combine(
      state$,
      fabProps$,
      topBar$,
      publicTab$.startWith(h(View)),
      privateTab$.startWith(h(View)),
      connectionsTab$.startWith(h(View)),
    )
    .map(([state, fabProps, topBar, publicTab, privateTab, connectionsTab]) =>
      h(MenuProvider, {customStyles: {backdrop: styles.menuBackdrop}}, [
        h(View, {style: styles.root}, [
          topBar,
          renderTabPage(state, fabProps, publicTab, privateTab, connectionsTab),
          renderTabBar(state),
        ]),
      ]),
    );
}
