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

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {h} from '@cycle/native-screen';
import {View, Text, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PeerMetadata} from '../../ssb/types';
import LocalPeerMetadata from '../../components/LocalPeerMetadata';
import {styles, iconProps} from './styles';

export default function view(localSyncPeers$: Stream<Array<PeerMetadata>>) {
  return localSyncPeers$.map(localSyncPeers =>
    h(FlatList, {
      data: localSyncPeers,
      style: styles.container as any,
      ListHeaderComponent: h(View, {style: styles.headerContainer}, [
        h(Text, {style: styles.headerText}, 'Peers around you'),
        h(Icon, {
          ...iconProps.info,
          name: 'information-outline',
          style: styles.infoIcon as any
        })
      ]),
      keyExtractor: (item: PeerMetadata, index: number) =>
        item.key || String(index),
      renderItem: ({item}: {item: PeerMetadata}) =>
        h(LocalPeerMetadata, {peer: item})
    })
  );
}
