/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import {Typography} from '../../../../global-styles/typography';
import Avatar from '../../../../components/Avatar';
import PopList, {Props as PopListProps} from './PopList';
import {PeerKV} from '../../../../drivers/ssb';

const dotStyle: ViewStyle = {
  width: 11,
  height: 11,
  position: 'absolute',
  bottom: 18.8,
  left: 52.65,
  borderRadius: 6,
  borderColor: Palette.backgroundText,
  borderWidth: 1,
};

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
  },

  itemContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },

  peer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },

  connectedDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerConnected,
  },

  connectingDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerConnecting,
  },

  disconnectingDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerDisconnecting,
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
    color: Palette.text,
    minWidth: 120,
  },

  peerMode: {
    flexDirection: 'row',
  },

  peerModeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginLeft: Dimensions.horizontalSpaceTiny,
  },
});

type Type =
  | 'bt'
  | 'lan'
  | 'internet'
  | 'dht'
  | 'pub'
  | 'room'
  | 'room-endpoint'
  | '?';

function detectType(peer: PeerKV[1]): Type {
  if (peer.type === 'bt') return 'bt';
  if (peer.type === 'lan') return 'lan';
  if (peer.type === 'internet') return 'internet';
  if (peer.type === 'dht') return 'dht';
  if (peer.type === 'pub') return 'pub';
  if (peer.type === 'room') return 'room';
  if (peer.type === 'room-endpoint') return 'room-endpoint';
  if (peer.source === 'local') return 'lan';
  if (peer.source === 'pub') return 'pub';
  if (peer.source === 'internet') return 'internet';
  if (peer.source === 'dht') return 'dht';
  if (peer.inferredType === 'bt') return 'bt';
  if (peer.inferredType === 'lan') return 'lan';
  if (peer.inferredType === 'tunnel') return 'room-endpoint';
  if (peer.inferredType === 'dht') return 'dht';
  if (peer.inferredType === 'internet') return 'internet';
  return '?';
}

function peerModeIcon(peer: PeerKV[1]): string {
  const type = detectType(peer);
  switch (type) {
    case 'bt':
      return 'bluetooth';

    case 'lan':
      return 'wifi';

    case 'dht':
    case 'room-endpoint':
      return 'account-network';

    case 'pub':
    case 'room':
    case 'internet':
      return 'server-network';

    default:
      return 'help-network';
  }
}

function peerModeDescription(peer: PeerKV[1]): string {
  const type = detectType(peer);
  switch (type) {
    case 'bt':
      return 'Bluetooth';

    case 'lan':
      return 'Local network';

    case 'dht':
      return 'Internet P2P';

    case 'room-endpoint':
      if (peer.roomName) return `Peer in room '${peer.roomName}'`;
      else return 'Room peer';

    case 'room':
      return 'Room server';

    case 'pub':
      return 'Pub server';

    case 'internet':
      return 'Server';

    default:
      return 'Unknown';
  }
}

function peerModeName(addr: PeerKV[0], peer: PeerKV[1]): string {
  const type = detectType(peer);
  const secondary =
    type === 'bt' ||
    type === 'lan' ||
    type === 'dht' ||
    type === 'room-endpoint'
      ? peer.key
      : addr;
  return peer.name || secondary;
}

export type Props = {
  peers: Array<PeerKV>;
  onPressPeer?: (peer: PeerKV) => void;
  style?: StyleProp<ViewStyle>;
};

export default class ConnectionsList extends PureComponent<Props> {
  private renderItem = ([addr, peer]: PeerKV) => {
    return h(
      TouchableOpacity,
      {
        ['key' as any]: addr,
        onPress: () => {
          if (this.props.onPressPeer) {
            this.props.onPressPeer([addr, peer]);
          }
        },
        style: styles.itemContainer,
        activeOpacity: 0.5,
      },
      [
        h(View, {style: styles.peer}, [
          h(Avatar, {
            size: Dimensions.avatarSizeNormal,
            url: peer['imageUrl' as any],
            style: styles.peerAvatar,
          }),
          h(View, {
            style:
              peer.state === 'connected'
                ? styles.connectedDot
                : peer.state === 'disconnecting'
                ? styles.disconnectingDot
                : styles.connectingDot,
          }),

          h(View, {style: styles.peerDetails}, [
            h(
              Text,
              {
                numberOfLines: 1,
                ellipsizeMode: 'middle',
                style: styles.peerName,
              },
              peerModeName(addr, peer),
            ),
            h(View, {style: styles.peerMode}, [
              h(Icon, {
                size: Dimensions.iconSizeSmall,
                color: Palette.textWeak,
                name: peerModeIcon(peer),
              }),
              h(Text, {style: styles.peerModeText}, peerModeDescription(peer)),
            ]),
          ]),
        ]),
      ],
    );
  };

  public render() {
    return h<PopListProps<PeerKV>>(PopList, {
      style: [styles.container, this.props.style],
      data: this.props.peers,
      keyExtractor: ([addr, p]) => p.hubBirth || addr,
      renderItem: this.renderItem,
      itemHeight: 70,
    });
  }
}
