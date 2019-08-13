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
  TouchableOpacity,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import {Typography} from '../../../../global-styles/typography';
import {StagedPeerKV, PeerKV} from '../../../../drivers/ssb';
import PopList, {Props as PopListProps} from './PopList';

const dotStyle: ViewStyle = {
  width: 11,
  height: 11,
  borderRadius: 6,
  borderColor: Palette.backgroundText,
  borderWidth: 1,
  marginTop: 5,
  marginLeft: 3.5,
  marginRight: Dimensions.horizontalSpaceTiny,
};

const SHORT_ITEM_HEIGHT = 48;
const ITEM_HEIGHT = 70;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Palette.backgroundTextBrand,
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  stagedPeerContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },

  roomContainer: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
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

  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  peerName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    minWidth: 120,
  },

  roomName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    marginLeft: Dimensions.horizontalSpaceTiny,
    minWidth: 120,
    flex: 1,
  },

  peerModeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  roomModeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginHorizontal: Dimensions.horizontalSpaceTiny,
  },

  roomOnlineCount: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

function peerModeIcon(peer: StagedKV[1]): string {
  if (peer.type === 'bt') return 'bluetooth';
  if (peer.type === 'lan') return 'wifi';
  if (peer.type === 'dht') return 'account-network';
  if (peer.type === 'internet') return 'server-network';
  const otherType = peer.type as string;
  if (otherType === 'pub') return 'server-network';
  if (otherType === 'room') return 'server-network';
  if (otherType === 'room-endpoint') return 'account-network';
  if (otherType === 'local') return 'wifi';
  return 'help-network';
}

function peerModeDescription(peer: StagedKV[1]): string {
  if (peer.type === 'bt') return 'Bluetooth';
  if (peer.type === 'lan') return 'Local network';
  if (peer.type === 'internet') return 'Server';
  if (peer.type === 'dht') {
    if (peer.role === 'client')
      return 'Internet P2P: looking for online friend...';
    if (peer.role === 'server')
      return 'Internet P2P: waiting for online friend...';
    return 'Internet P2P: searching...';
  }
  const otherType = peer.type as string;
  if (otherType === 'pub') return 'Pub server';
  if (otherType === 'room') return 'Room server';
  if (otherType === 'room-endpoint') {
    const peerRoomname: string | undefined = (peer as any).roomName;
    if (peerRoomname) return `Peer in room '${peerRoomname}'`;
    else return 'Room peer';
  }
  if (otherType === 'local') return 'Local network';
  return 'Unknown';
}

type RoomData = {
  key: PeerKV[1]['key'];
  state: PeerKV[1]['state'];
  type: 'room';
  name?: string;
  onlineCount?: number;
};

type StagedRoomPeerData = {
  type: 'room-endpoint';
  key: string;
  room: string;
  note?: never;
};

type RoomKV = [string, RoomData];

type StagedKV = [string, StagedRoomPeerData | StagedPeerKV[1]];

type MixedPeerKV = RoomKV | StagedKV;

export type Props = {
  style?: StyleProp<ViewStyle>;
  rooms: Array<PeerKV | RoomKV>;
  stagedPeers: Array<StagedPeerKV>;
  onPressRoom?: (peer: [string, RoomData]) => void;
  onPressStagedPeer?: (peer: StagedKV) => void;
};

type State = {
  misc: Array<MixedPeerKV>;
  peersByRoom: Array<Array<MixedPeerKV>>;
};

function isRoomKV(kv: MixedPeerKV): kv is RoomKV {
  return kv[1].type === 'room';
}

export default class StagedConnectionsList extends PureComponent<Props, State> {
  public state: State = {
    misc: [],
    peersByRoom: [],
  };

  public static getDerivedStateFromProps(props: Props): State {
    const misc: Array<MixedPeerKV> = [];
    const roomGroups: Record<string, Array<MixedPeerKV>> = {};

    for (const peer of props.rooms as Array<RoomKV>) {
      roomGroups[peer[1].key!] = [peer];
    }

    for (const peer of props.stagedPeers as Array<MixedPeerKV>) {
      if (peer[1].type === 'room-endpoint' && roomGroups[peer[1].room]) {
        roomGroups[peer[1].room].push(peer);
      } else {
        misc.push(peer);
      }
    }

    return {misc, peersByRoom: Object.values(roomGroups)};
  }

  private renderStagedPeer = ([addr, peer]: StagedKV) => {
    return h(
      TouchableOpacity,
      {
        ['key' as any]: peer[0],
        onPress: () => {
          if (this.props.onPressStagedPeer) {
            this.props.onPressStagedPeer([addr, peer]);
          }
        },
        style: styles.stagedPeerContainer,
        activeOpacity: 0.5,
      },
      [
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
              {
                numberOfLines: 1,
                ellipsizeMode: 'middle',
                style: styles.peerName,
              },
              (peer as any).name || peer.note || peer.key,
            ),
            h(Text, {style: styles.peerModeText}, peerModeDescription(peer)),
          ]),
        ]),
      ],
    );
  };

  private renderRoom = ([addr, peer]: RoomKV) => {
    return h(
      TouchableOpacity,
      {
        ['key' as any]: addr,
        onPress: () => {
          if (this.props.onPressRoom) {
            this.props.onPressRoom([addr, peer]);
          }
        },
        style: styles.roomContainer,
        activeOpacity: 0.5,
      },
      [
        h(View, {style: styles.peer}, [
          h(View, {style: styles.peerDetails}, [
            h(View, {style: styles.roomRow}, [
              h(View, {
                style:
                  peer.state === 'connected'
                    ? styles.connectedDot
                    : peer.state === 'disconnecting'
                    ? styles.disconnectingDot
                    : styles.connectingDot,
              }),
              h(Icon, {
                size: Dimensions.iconSizeSmall,
                color: Palette.textWeak,
                name: peerModeIcon(peer as any),
              }),
              h(
                Text,
                {
                  numberOfLines: 1,
                  ellipsizeMode: 'tail',
                  style: styles.roomName,
                },
                peer.name || addr,
              ),
              typeof peer.onlineCount === 'number'
                ? h(
                    Text,
                    {style: styles.roomOnlineCount},
                    peer.onlineCount <= 1
                      ? '(only you online)'
                      : `(${peer.onlineCount} online)`,
                  )
                : (null as any),
            ]),
          ]),
        ]),
      ],
    );
  };

  private renderItem = (entry: MixedPeerKV) => {
    if (isRoomKV(entry)) {
      return this.renderRoom(entry);
    } else {
      return this.renderStagedPeer(entry);
    }
  };

  private getItemHeight = (entry: MixedPeerKV) => {
    return isRoomKV(entry) ? SHORT_ITEM_HEIGHT : ITEM_HEIGHT;
  };

  public render() {
    return h(View, {style: this.props.style}, [
      this.state.misc.length
        ? h<PopListProps<MixedPeerKV>>(PopList, {
            ['key' as any]: 'misc',
            style: styles.container,
            data: this.state.misc,
            keyExtractor: ([addr]) => addr,
            renderItem: this.renderStagedPeer,
            itemHeight: ITEM_HEIGHT,
          })
        : (null as any),

      ...this.state.peersByRoom.map(peers =>
        h<PopListProps<MixedPeerKV>>(PopList, {
          ['key' as any]: peers.length ? peers[0][0] : Math.random(),
          style: styles.container,
          data: peers,
          keyExtractor: ([addr]) => addr,
          renderItem: this.renderItem,
          getItemHeight: this.getItemHeight,
        }),
      ),
    ]);
  }
}
