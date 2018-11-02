/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ScrollView, View, TouchableHighlight} from 'react-native';
import * as React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './styles';
import {State} from './model';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import ConnectionsList from '../../../components/ConnectionsList';
import StagedConnectionsList from '../../../components/StagedConnectionsList';
import EmptySection from '../../../components/EmptySection';

type ModeProps = {
  onPress?: () => void;
  active: boolean;
  icon: string;
  label: string;
};

function ConnectivityMode(props: ModeProps) {
  return h(
    TouchableHighlight,
    {
      onPress: props.onPress,
      style: styles.modeTouchable,
      hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
      underlayColor: '#00000022',
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeBig,
        color: props.active
          ? Palette.brand.background
          : Palette.brand.textVeryWeak,
        name: props.icon,
        accessible: true,
        accessibilityLabel: props.label,
      }),
    ],
  );
}

function ConnectivityModes(state: State) {
  return h(View, {style: styles.modesContainer}, [
    // h(ConnectivityMode, {
    //   sel: 'bluetooth-mode',
    //   active: false,
    //   icon: 'bluetooth',
    //   label: 'Bluetooth Mode',
    // }),

    h(ConnectivityMode, {
      sel: 'lan-mode',
      active: state.lanEnabled,
      icon: 'wifi',
      label: 'Local Network Mode',
    }),

    h(ConnectivityMode, {
      sel: 'dht-mode',
      active: state.internetEnabled,
      icon: 'account-network',
      label: 'Internet P2P Mode',
    }),

    h(ConnectivityMode, {
      sel: 'pub-mode',
      active: state.internetEnabled,
      icon: 'server-network',
      label: 'Internet Servers Mode',
    }),
  ]);
}

function Body(state: State) {
  const {lanEnabled, internetEnabled, peers, stagedPeers} = state;
  if (!lanEnabled && !internetEnabled) {
    return h(EmptySection, {
      style: styles.emptySection,
      image: require('../../../../../images/noun-lantern.png'),
      title: 'Offline',
      description:
        'Turn on some connection mode\nor just enjoy some existing content',
    });
  }

  if (peers.length === 0 && stagedPeers.length === 0) {
    return h(EmptySection, {
      style: styles.emptySection,
      image: require('../../../../../images/noun-crops.png'),
      title: 'No connections',
      description:
        'Invite a friend to connect with\nor sync with people nearby',
    });
  }

  return h(React.Fragment, [
    peers.length > 0
      ? h(ConnectionsList, {
          sel: 'connections-list',
          peers,
          style: styles.connectionsList,
        })
      : null as any,

    stagedPeers.length > 0
      ? h(StagedConnectionsList, {peers: state.stagedPeers})
      : null as any,
  ]);
}

export default function view(state$: Stream<State>) {
  return state$.map(state => {
    return h(ScrollView, {style: styles.container}, [
      ConnectivityModes(state),
      Body(state),
    ]);
  });
}
