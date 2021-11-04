// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {h} from '@cycle/react';
import {Dimensions} from '../../../../../global-styles/dimens';
import {StagedPeerKV, PeerKV} from '../../../../../ssb/types';
import StagedItem from './StagedItem';
import RoomItem from './RoomItem';
import ConnectionItem from './ConnectionItem';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginTop: Dimensions.verticalSpaceNormal,
  },
});

interface RoomData {
  key: PeerKV[1]['key'];
  state: PeerKV[1]['state'];
  type: 'room';
  pool: 'hub';
  name?: string;
  onlineCount?: number;
}

interface StagedRoomEndpointData {
  type: 'room-attendant' | 'room-endpoint'; // "endpoint" is legacy terminology
  key: string;
  room: string;
  note?: never;
}

type RoomKV = [string, RoomData];

type StagedKV = [string, StagedRoomEndpointData | StagedPeerKV[1]];

type MixedPeerKV = PeerKV | RoomKV | StagedKV;

export interface Props {
  style?: StyleProp<ViewStyle>;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV | RoomKV>;
  stagedPeers: Array<StagedKV>;
  onPressPeer?: (peer: PeerKV) => void;
  onPressRoom?: (peer: [string, RoomData]) => void;
  onPressStaged?: (peer: StagedKV) => void;
}

interface State {
  peers: Array<PeerKV>;
  staged: Array<StagedKV>;
  mixedByRoom: Array<[string, Array<MixedPeerKV>]>;
}

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

  // type == 'room-attendant'
  const _data = data as StagedRoomEndpointData;
  if (data.type === 'room-attendant' && _data.room && roomGroups[_data.room]) {
    return _data.room;
  }
  if (data.type === 'room-endpoint' && _data.room && roomGroups[_data.room]) {
    return _data.room;
  }

  // inferredType == 'tunnel', lets check if it's a room-attendant
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

function compareBy<T>(getKey: (t: T) => string) {
  return (a: T, b: T) => {
    const ak = getKey(a);
    const bk = getKey(b);
    if (ak < bk) return -1;
    if (ak > bk) return 1;
    return 0;
  };
}

function getHubSortKey([addr, data]: PeerKV) {
  if (data.hubBirth) return `${data.hubBirth}`;
  else return addr;
}

/**
 * Sort peers lexicographically by the extracted key:
 * - First, the room server
 * - Second, room peers in connection
 * - Third, staged room peers
 */
function getRoomSortKey(entry: MixedPeerKV) {
  const [addr] = entry;
  if (isRoomKV(entry)) {
    return `a${addr}`;
  } else if (isInConnection(entry)) {
    return `b${addr}`;
  } else {
    return `c${addr}`;
  }
}

export default class ListOfPeers extends Component<Props, State> {
  public state: State = {
    peers: [],
    staged: [],
    mixedByRoom: [],
  };

  public static getDerivedStateFromProps(
    props: ListOfPeers['props'],
  ): ListOfPeers['state'] {
    const addrSet: Set<string> = new Set();
    const peers: Array<PeerKV> = [];
    const staged: Array<StagedKV> = [];
    const roomGroups: Record<string, Array<MixedPeerKV>> = {};

    for (const peer of props.rooms as Array<RoomKV>) {
      if (addrSet.has(peer[0])) continue;
      else addrSet.add(peer[0]);
      roomGroups[peer[1].key!] = [peer];
    }

    for (const peer of props.peers as Array<PeerKV>) {
      if (addrSet.has(peer[0])) continue;
      else addrSet.add(peer[0]);
      const room = isRoomEndpoint(peer, roomGroups);
      if (room) {
        if (peer[1].pool !== 'hub') peer[1].pool = 'hub';
        roomGroups[room].push(peer);
      } else {
        peers.push(peer);
      }
    }

    for (const peer of props.stagedPeers) {
      if (addrSet.has(peer[0])) continue;
      else addrSet.add(peer[0]);
      const room = isRoomEndpoint(peer, roomGroups);
      if (room) {
        roomGroups[room].push(peer);
      } else {
        staged.push(peer as StagedKV);
      }
    }

    // Convert Record to Array
    const mixedByRoom = Object.entries(roomGroups)
      // Sort groups by roomKey
      .sort(compareBy(([roomKey]) => roomKey))
      // Update the "true" onlineCount for the room
      .map((mixed) => {
        const [roomKey, entries] = mixed;
        const roomIndex = entries.findIndex((peer) => peer[1].key === roomKey);
        if (roomIndex < 0) return mixed;
        // entries.length has the room plus all attendants EXCEPT us, we want to
        // exclude the room (-1) but add ourselves (+1), so the calculation is
        // `entries.length - 1 + 1`, hence just `entries.length`
        (entries[roomIndex] as RoomKV)[1].onlineCount = entries.length;
        return mixed;
      });

    return {peers, staged, mixedByRoom};
  }

  public shouldComponentUpdate(nextProps: ListOfPeers['props']) {
    const prevProps = this.props;
    if (nextProps.onPressPeer !== prevProps.onPressPeer) return true;
    if (nextProps.onPressRoom !== prevProps.onPressRoom) return true;
    if (nextProps.onPressStaged !== prevProps.onPressStaged) return true;
    if (nextProps.peers !== prevProps.peers) return true;
    if (nextProps.rooms !== prevProps.rooms) return true;
    if (nextProps.stagedPeers !== prevProps.stagedPeers) return true;
    return false;
  }

  // private getItemHeight = (entry: MixedPeerKV) => {
  //   return isRoomKV(entry) ? SHORT_ITEM_HEIGHT : ITEM_HEIGHT;
  // };

  private renderPeer = (peer: PeerKV) => {
    return h(ConnectionItem, {
      key: peer[0],
      peer,
      onPressPeer: this.props.onPressPeer,
    });
  };

  private renderStagedPeer = (peer: StagedKV) => {
    return h(StagedItem, {
      key: peer[0],
      peer,
      onPressStaged: this.props.onPressStaged,
    });
  };

  private renderRoom = (room: RoomKV) => {
    return h(RoomItem, {
      key: room[0],
      room,
      onPressRoom: this.props.onPressRoom,
    });
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

  public render() {
    return h(View, {style: this.props.style}, [
      // Hub peers first
      this.state.peers.length > 0
        ? h(
            View,
            {key: 'inconnection', style: styles.container},
            this.state.peers
              .sort(compareBy(getHubSortKey))
              .map((peer) => this.renderPeer(peer)),
          )
        : null,

      // Rooms
      ...this.state.mixedByRoom.map(([roomKey, peers]) =>
        h(
          View,
          {key: roomKey, style: styles.container},
          peers
            .sort(compareBy(getRoomSortKey))
            .map((peer) => this.renderItem(peer)),
        ),
      ),

      // Staging peers last
      this.state.staged.length > 0
        ? h(
            View,
            {key: 'staged', style: styles.container},
            this.state.staged
              .sort(compareBy((p) => p[0]))
              .map((peer) => this.renderStagedPeer(peer)),
          )
        : null,
    ]);
  }
}
