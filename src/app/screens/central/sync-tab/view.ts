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
import {ScrollView} from 'react-native';
import {styles} from './styles';
import {State} from './model';
import InviteHeader from '../../../components/InviteHeader';
import SyncChannelAccordion from '../../../components/SyncChannelAccordion';

export default function view(state$: Stream<State>) {
  return state$.map(state =>
    h(ScrollView, {style: styles.container}, [
      h(InviteHeader),

      // h(SyncChannelAccordion, {
      //   icon: 'bluetooth',
      //   name: 'Bluetooth',
      //   active: false,
      //   info: 'Connect with people very near',
      //   onPressActivate: () => {},
      //   peers: state.peers.bluetooth,
      // }),

      h(SyncChannelAccordion, {
        sel: 'lan-peers',
        icon: 'wifi',
        name: 'Local network',
        active: true,
        info: 'Connect with people in the same space',
        peers: state.peers.lan,
      }),

      // h(SyncChannelAccordion, {
      //   icon: 'account-network',
      //   name: 'Internet P2P',
      //   active: false,
      //   info: 'Connect with friends online now on the internet',
      //   peers: state.peers.dht,
      // }),

      h(SyncChannelAccordion, {
        sel: 'pub-peers',
        icon: 'server-network',
        name: 'Internet servers',
        active: true,
        info: 'Connect with community servers on the internet',
        peers: state.peers.pub,
      }),
    ]),
  );
}
