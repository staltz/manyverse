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

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ScrollView, View, TouchableHighlight} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './styles';
import {State} from './model';
import ConnectionsList from '../../../components/ConnectionsList';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';

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

    // h(ConnectivityMode, {
    //   sel: 'dht-mode',
    //   active: false,
    //   icon: 'account-network',
    //   label: 'Internet P2P Mode',
    // }),

    h(ConnectivityMode, {
      sel: 'pub-mode',
      active: state.internetEnabled,
      icon: 'server-network',
      label: 'Internet Servers Mode',
    }),
  ]);
}

export default function view(state$: Stream<State>) {
  return state$.map(state =>
    h(ScrollView, {style: styles.container}, [
      ConnectivityModes(state),

      h(ConnectionsList, {sel: 'connections-list', peers: state.peers}),
    ]),
  );
}
