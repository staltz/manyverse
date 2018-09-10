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
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {PeerMetadata, FeedId} from 'ssb-typescript';
import Avatar from './Avatar';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Palette.brand.textBackground,
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

  peerMode: {
    flexDirection: 'row',
  },

  peerModeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
    marginLeft: Dimensions.horizontalSpaceSmall,
  },
});

function peerModeIcon(source: PeerMetadata['source']): string {
  if (source === 'local') return 'wifi';
  if ((source as any) === 'dht') return 'account-network';
  if (source === 'pub') return 'server-network';
  return 'server-network';
}

function peerModeTitle(source: PeerMetadata['source']): string {
  if (source === 'local') return 'Local network';
  if ((source as any) === 'dht') return 'Internet P2P';
  if (source === 'pub') return 'Internet server';
  return 'Internet server';
}

export type Props = {
  peers: Array<PeerMetadata>;
  onPressPeer?: (id: FeedId) => void;
  style?: StyleProp<ViewStyle>;
};

export default class ConnectionsList extends PureComponent<Props> {
  private renderItem(peer: PeerMetadata) {
    const touchableProps = {
      onPress: () => {
        if (this.props.onPressPeer) {
          this.props.onPressPeer(peer.key);
        }
      },
    };

    const peerName = h(TouchableOpacity, touchableProps, [
      h(
        Text,
        {
          numberOfLines: 1,
          ellipsizeMode: 'middle',
          style: styles.peerName,
        },
        `${peer.name || peer.key}`,
      ),
    ]);

    const peerMode = h(View, {style: styles.peerMode}, [
      h(Icon, {
        size: Dimensions.iconSizeSmall,
        color: Palette.brand.textWeak,
        name: peerModeIcon(peer.source),
      }),
      h(Text, {style: styles.peerModeText}, peerModeTitle(peer.source)),
    ]);

    return h(View, {style: styles.peer}, [
      h(TouchableOpacity, touchableProps, [
        h(Avatar, {
          size: Dimensions.avatarSizeNormal,
          url: peer['imageUrl' as any],
          style: styles.peerAvatar,
        }),
      ]),
      h(View, {style: styles.peerDetails}, [peerName, peerMode]),
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
