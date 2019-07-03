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
  StyleProp,
  ViewStyle,
  TouchableHighlight,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import {Typography} from '../../../../global-styles/typography';
import {StagedPeerKV} from '../../../../drivers/ssb';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Palette.backgroundTextBrand,
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
    backgroundColor: Palette.backgroundBrandWeakest,
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
    color: Palette.text,
    minWidth: 120,
  },

  peerModeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

function peerModeIcon([_addr, peer]: StagedPeerKV): string {
  if (peer.type === 'bt') return 'bluetooth';
  if ((peer.type as any) === 'local') return 'wifi';
  if (peer.type === 'lan') return 'wifi';
  if (peer.type === 'dht') return 'account-network';
  if (peer.type === 'internet') return 'server-network';
  return 'server-network';
}

function peerModeDescription([_addr, peer]: StagedPeerKV): string {
  if (peer.type === 'bt') return 'Bluetooth';
  if ((peer.type as any) === 'local') return 'Local network';
  if (peer.type === 'lan') return 'Local network';
  if (peer.type === 'dht' && peer.role === 'client')
    return 'Internet P2P: looking for online friend...';
  if (peer.type === 'dht' && peer.role === 'server')
    return 'Internet P2P: waiting for online friend...';
  if (peer.type === 'dht' && !peer.role) return 'Internet P2P: searching...';
  if (peer.type === 'internet') return 'Internet server: connecting...';
  return '...';
}

export type Props = {
  peers: Array<StagedPeerKV>;
  style?: StyleProp<ViewStyle>;
  onPressPeer?: (peer: StagedPeerKV) => void;
};

export default class StagedConnectionsList extends PureComponent<Props> {
  private renderItem(peer: StagedPeerKV) {
    const touchableProps = {
      onPress: () => {
        if (this.props.onPressPeer) {
          this.props.onPressPeer(peer);
        }
      },
      underlayColor: Palette.backgroundTextBrand,
      activeOpacity: 0.4,
    };

    return h(TouchableHighlight, touchableProps, [
      h(View, {style: styles.peer}, [
        h(View, {style: styles.peerAvatar}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            color: Palette.backgroundBrandWeaker,
            name: peerModeIcon(peer),
          }),
        ]),
        h(View, {style: styles.peerDetails}, [
          h(
            Text,
            {numberOfLines: 1, ellipsizeMode: 'middle', style: styles.peerName},
            peer[1].note || peer[1].key,
          ),
          h(Text, {style: styles.peerModeText}, peerModeDescription(peer)),
        ]),
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
