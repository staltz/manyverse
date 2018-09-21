/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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

import {PureComponent} from 'react';
import {View, Text, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {StagedPeerMetadata} from '../drivers/ssb';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Palette.indigo0,
  },

  peer: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },

  peerAvatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Dimensions.avatarSizeNormal * 0.5,
    backgroundColor: Palette.indigo1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  peerDetails: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  peerName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.text,
    minWidth: 120,
  },

  peerModeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

function peerModeIcon(peer: StagedPeerMetadata): string {
  if (peer.source === 'local') return 'wifi';
  if (peer.source === 'dht') return 'account-network';
  if (peer.source === 'pub') return 'server-network';
  return 'server-network';
}

function peerModeDescription(peer: StagedPeerMetadata): string {
  if (peer.source === 'local') return 'Local network';
  if (peer.source === 'dht' && peer.role === 'client')
    return 'Internet P2P: looking for online friend...';
  if (peer.source === 'dht' && peer.role === 'server')
    return 'Internet P2P: waiting for online friend...';
  if (peer.source === 'dht' && !peer.role) return 'Internet P2P: searching...';
  if (peer.source === 'pub') return 'Internet server: connecting...';
  return '...';
}

export type Props = {
  peers: Array<StagedPeerMetadata>;
  style?: StyleProp<ViewStyle>;
};

export default class StagedConnectionsList extends PureComponent<Props> {
  private renderItem(peer: StagedPeerMetadata) {
    return h(View, {style: styles.peer}, [
      h(View, {style: styles.peerAvatar}, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.indigo3,
          name: peerModeIcon(peer),
        }),
      ]),
      h(View, {style: styles.peerDetails}, [
        h(
          Text,
          {numberOfLines: 1, ellipsizeMode: 'middle', style: styles.peerName},
          peer.key,
        ),
        h(Text, {style: styles.peerModeText}, peerModeDescription(peer)),
      ]),
    ]);
  }

  public render() {
    return h(
      View,
      {style: [styles.container, this.props.style]},
      this.props.peers.map(peer => this.renderItem(peer)),
    );
  }
}
