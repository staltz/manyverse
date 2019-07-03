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
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {FeedId} from 'ssb-typescript';
import Avatar from './Avatar';
import {PeerKV} from '../drivers/ssb';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
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
    marginLeft: Dimensions.horizontalSpaceSmall,
  },
});

function peerModeIcon(peer: PeerKV[1]): string {
  if (peer.type === 'bt') return 'bluetooth';
  if (peer.type === 'lan') return 'wifi';
  if (peer.type === 'internet') return 'server-network';
  if (peer.type === 'dht') return 'account-network';
  if (peer.source === 'local') return 'wifi';
  if (peer.source === 'pub') return 'server-network';
  if (peer.source === 'internet') return 'server-network';
  if (peer.source === 'dht') return 'account-network';
  return 'server-network';
}

function peerModeTitle(peer: PeerKV[1]): string {
  if (peer.type === 'bt') return 'Bluetooth';
  if (peer.type === 'lan') return 'Local network';
  if (peer.type === 'internet') return 'Internet server';
  if (peer.type === 'dht') return 'Internet P2P';
  if (peer.source === 'local') return 'Local network';
  if (peer.source === 'pub') return 'Internet server';
  if (peer.source === 'internet') return 'Internet server';
  if (peer.source === 'dht') return 'Internet P2P';
  return 'Internet server';
}

export type Props = {
  peers: Array<PeerKV>;
  onPressPeer?: (id: FeedId) => void;
  style?: StyleProp<ViewStyle>;
};

export default class ConnectionsList extends PureComponent<Props> {
  private renderItem([_addr, peer]: PeerKV) {
    const touchableProps = {
      onPress: () => {
        if (this.props.onPressPeer) {
          this.props.onPressPeer(peer.key!);
        }
      },
      activeOpacity: 0.4,
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
        color: Palette.textWeak,
        name: peerModeIcon(peer),
      }),
      h(Text, {style: styles.peerModeText}, peerModeTitle(peer)),
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
