/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {h} from '@cycle/react';
import {Dimensions} from '../../../../../global-styles/dimens';
import {StagedPeerKV, PeerKV} from '../../../../../ssb/types';
import PopList, {Props as PopListProps} from './PopList';
import StagedItem, {Props as StagedItemProps} from './StagedItem';
import RoomItem, {Props as RoomItemProps} from './RoomItem';
import ConnectionItem from './ConnectionItem';

const SHORT_ITEM_HEIGHT = 48;
const ITEM_HEIGHT = 70;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginTop: Dimensions.verticalSpaceNormal,
  },
});

type RoomData = {
  key: PeerKV[1]['key'];
  state: PeerKV[1]['state'];
  type: 'room';
  name?: string;
  onlineCount?: number;
};

type StagedRoomEndpointData = {
  type: 'room-endpoint';
  key: string;
  room: string;
  note?: never;
};

type RoomKV = [string, RoomData];

type StagedKV = [string, StagedRoomEndpointData | StagedPeerKV[1]];

type MixedPeerKV = PeerKV | RoomKV | StagedKV;

export type Props = {
  style?: StyleProp<ViewStyle>;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV | RoomKV>;
  stagedPeers: Array<StagedKV>;
  onPressPeer?: (peer: PeerKV) => void;
  onPressRoom?: (peer: [string, RoomData]) => void;
  onPressStaged?: (peer: StagedKV) => void;
};

type State = {
  peers: Array<PeerKV>;
  staged: Array<StagedKV>;
  mixedByRoom: Array<[string, Array<MixedPeerKV>]>;
};

function isRoomKV(kv: MixedPeerKV): kv is RoomKV {
  return kv[1].type === 'room';
}

function isInConnection(kv: MixedPeerKV): kv is PeerKV {
  return (kv[1] as any).pool === 'hub';
}

function isRoomEndpoint(
  kv: PeerKV | StagedKV,
  roomGroups: Record<string, Array<MixedPeerKV>>,
): string | false {
  const [addr, data] = kv;

  // type == 'room-endpoint'
  const _data = data as StagedRoomEndpointData;
  if (data.type === 'room-endpoint' && _data.room && roomGroups[_data.room]) {
    return _data.room;
  }

  // inferredType == 'tunnel', lets check if it's a room-endpoint
  if ((kv as PeerKV)[1].inferredType === 'tunnel') {
    if (!data.key) return false;
    if (!addr.includes(':' + data.key)) return false;
    if (!addr.startsWith('tunnel:')) return false;
    let room: string;
    try {
      room = addr.split(':' + data.key)[0].split('tunnel:')[1];
    } catch (err) {
      return false;
    }
    if (!room) return false;
    if (!roomGroups[room]) return false;
    return room;
  }

  return false;
}

export default class StagedConnectionsList extends Component<Props, State> {
  public state: State = {
    peers: [],
    staged: [],
    mixedByRoom: [],
  };

  public static getDerivedStateFromProps(props: Props): State {
    const peers: Array<PeerKV> = [];
    const staged: Array<StagedKV> = [];
    const roomGroups: Record<string, Array<MixedPeerKV>> = {};

    for (const peer of props.rooms as Array<RoomKV>) {
      roomGroups[peer[1].key!] = [peer];
    }

    for (const peer of props.peers as Array<PeerKV>) {
      const room = isRoomEndpoint(peer, roomGroups);
      if (room) {
        if (peer[1].pool !== 'hub') peer[1].pool = 'hub';
        roomGroups[room].push(peer);
      } else {
        peers.push(peer);
      }
    }

    for (const peer of props.stagedPeers) {
      const room = isRoomEndpoint(peer, roomGroups);
      if (room) {
        roomGroups[room].push(peer);
      } else {
        staged.push(peer as StagedKV);
      }
    }

    // Convert Record to Array and sort by roomKey
    const mixedByRoom = Object.entries(roomGroups).sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });

    return {peers, staged, mixedByRoom};
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    if (nextProps.peers !== prevProps.peers) return true;
    if (nextProps.rooms !== prevProps.rooms) return true;
    if (nextProps.stagedPeers !== prevProps.stagedPeers) return true;
    return false;
  }

  private renderStagedPeer = (peer: StagedKV) => {
    return h(StagedItem, {
      peer,
      onPressStaged: this.props.onPressStaged,
    } as StagedItemProps);
  };

  private renderPeer = (peer: PeerKV) => {
    return h(ConnectionItem, {peer, onPressPeer: this.props.onPressPeer});
  };

  private renderRoom = (room: RoomKV) => {
    return h(RoomItem, {
      room,
      onPressRoom: this.props.onPressRoom,
    } as RoomItemProps);
  };

  private renderItem = (entry: MixedPeerKV) => {
    if (isRoomKV(entry)) {
      return this.renderRoom(entry);
    } else if (isInConnection(entry)) {
      return this.renderPeer(entry);
    } else {
      return this.renderStagedPeer(entry);
    }
  };

  private getItemHeight = (entry: MixedPeerKV) => {
    return isRoomKV(entry) ? SHORT_ITEM_HEIGHT : ITEM_HEIGHT;
  };

  /**
   * Sort peers lexicographically by the extracted key:
   * - First, the room server
   * - Second, room peers in connection
   * - Third, staged room peers
   */
  private roomsKeyExtractor = (entry: MixedPeerKV) => {
    const [addr] = entry;
    if (isRoomKV(entry)) {
      return `A-${addr}`;
    } else if (isInConnection(entry)) {
      return `B-${addr}`;
    } else {
      return `C-${addr}`;
    }
  };

  public render() {
    return h(View, {style: this.props.style}, [
      // Hub peers first
      h<PopListProps<PeerKV>>(PopList, {
        key: 'inconnection',
        style: styles.container,
        data: this.state.peers,
        keyExtractor: ([addr, data]) => data.hubBirth ?? addr,
        renderItem: this.renderPeer,
        itemHeight: ITEM_HEIGHT,
      }),

      // Rooms
      ...this.state.mixedByRoom.map(([roomKey, peers]) =>
        h<PopListProps<MixedPeerKV>>(PopList, {
          key: roomKey,
          style: styles.container,
          data: peers,
          keyExtractor: this.roomsKeyExtractor,
          renderItem: this.renderItem,
          getItemHeight: this.getItemHeight,
        }),
      ),

      // Staging peers last
      h<PopListProps<StagedKV>>(PopList, {
        key: 'staged',
        style: styles.container,
        data: this.state.staged,
        keyExtractor: ([addr]) => addr,
        renderItem: this.renderStagedPeer,
        itemHeight: ITEM_HEIGHT,
      }),
    ]);
  }
}
