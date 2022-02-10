// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import concat from 'xstream/extra/concat';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {Platform} from 'react-native';
import {SSBSource} from '~frontend/drivers/ssb';
import {State as AppState} from '~frontend/drivers/appstate';
import {PeerKV, StagedPeerKV} from '~frontend/ssb/types';
import {NetworkSource} from '~frontend/drivers/network';
import {Props} from './props';

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  bluetoothEnabled: boolean;
  lanEnabled: boolean;
  internetEnabled: boolean;
  peers: Array<PeerKV>;
  rooms: Array<PeerKV>;
  stagedPeers: Array<StagedPeerKV>;
  timestampPeersAndRooms: number;
  timestampStagedPeers: number;
  timestampPeerStates: number;
  bluetoothLastScanned: number;
  itemMenu: {
    opened: boolean;
    type: 'conn' | 'invite' | 'staging' | 'room' | 'staged-room';
    target?: PeerKV | StagedPeerKV;
  };
  latestInviteMenuTarget?: StagedPeerKV;
}

export interface Actions {
  pingConnectivityModes$: Stream<any>;
  openPeerInConnection$: Stream<PeerKV>;
  openStagedPeer$: Stream<StagedPeerKV>;
  openRoom$: Stream<PeerKV>;
  connectPeer$: Stream<any>;
  disconnectPeer$: Stream<any>;
  disconnectForgetPeer$: Stream<any>;
  forgetPeer$: Stream<any>;
  goToManageAliases$: Stream<any>;
  signInRoom$: Stream<any>;
  shareRoomInvite$: Stream<any>;
  closeItemMenu$: Stream<any>;
  goToPeerProfile$: Stream<any>;
}

/**
 * Listen to the `factory()` stream only while the AppState is 'active'.
 */
function onlyWhileAppIsInForeground<T>(
  appstate$: Stream<AppState>,
  factory: () => Stream<T>,
): Stream<T> {
  return appstate$
    .startWith('active')
    .map((appstate) => {
      if (appstate === 'active') {
        return factory();
      } else {
        return xs.never() as Stream<T>;
      }
    })
    .flatten();
}

function sampledEvery<T>(period: number): (ins: Stream<T>) => Stream<T> {
  return function sampledEveryOperator(ins: Stream<T>) {
    return xs.periodic(period).startWith(0).compose(sample(ins));
  };
}

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  ssbSource: SSBSource,
  networkSource: NetworkSource,
  appstate$: Stream<AppState>,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(_prev?: State): State {
        return {
          selfFeedId: props.selfFeedId,
          selfAvatarUrl: props.selfAvatarUrl,
          peers: props.peers,
          rooms: props.rooms,
          stagedPeers: props.stagedPeers,
          bluetoothEnabled: true,
          lanEnabled: true,
          internetEnabled: true,
          bluetoothLastScanned: 0,
          timestampPeersAndRooms: 0,
          timestampStagedPeers: 0,
          timestampPeerStates: 0,
          itemMenu: {opened: false, type: 'conn'},
        };
      },
  );

  const updateBluetoothEnabled$ =
    Platform.OS === 'ios'
      ? xs.empty()
      : actions.pingConnectivityModes$
          .map(() => networkSource.bluetoothIsEnabled())
          .flatten()
          .map(
            (bluetoothEnabled) =>
              function updateBluetoothEnabled(prev: State): State {
                return {...prev, bluetoothEnabled};
              },
          );

  const updateLanEnabled$ = actions.pingConnectivityModes$
    .map(() => networkSource.wifiIsEnabled())
    .flatten()
    .map(
      (lanEnabled) =>
        function updateLanEnabled(prev: State): State {
          return {...prev, lanEnabled};
        },
    );

  const updateInternetEnabled$ = actions.pingConnectivityModes$
    .map(() => networkSource.hasInternetConnection())
    .flatten()
    .map(
      (internetEnabled) =>
        function updateInternetEnabled(prev: State): State {
          return {...prev, internetEnabled};
        },
    );

  const updateBluetoothLastScanned$ = ssbSource.bluetoothScanState$.map(
    (_scanState: string) =>
      function setBluetoothScanState(prev: State): State {
        return {...prev, bluetoothLastScanned: Date.now()};
      },
  );

  const updateConnectionStateReducer$ = onlyWhileAppIsInForeground(
    appstate$,
    () => ssbSource.peers$,
  ).map(
    (allNewPeers) =>
      function updateConnectionStateReducer(prev: State): State {
        let updatedPeers = false;
        let updatedRooms = false;
        for (const peer of prev.peers) {
          const newPeer = allNewPeers.find((p) => p[0] === peer[0]);
          if (!newPeer) {
            peer[1].state = 'disconnecting';
            updatedPeers = true;
          } else if (newPeer[1].state !== peer[1].state) {
            peer[1].state = newPeer[1].state;
            updatedPeers = true;
          }
        }
        for (const room of prev.rooms) {
          const newRoom = allNewPeers.find((p) => p[0] === room[0]);
          if (!newRoom) {
            room[1].state = 'disconnecting';
            updatedRooms = true;
          } else if (newRoom[1].state !== room[1].state) {
            room[1].state = newRoom[1].state;
            updatedRooms = true;
          }
        }

        if (!updatedPeers && !updatedRooms) {
          return prev;
        } else if (updatedPeers && !updatedRooms) {
          return {
            ...prev,
            peers: [...prev.peers],
            timestampPeerStates: Date.now(),
          };
        } else if (!updatedPeers && updatedRooms) {
          return {
            ...prev,
            rooms: [...prev.rooms],
            timestampPeerStates: Date.now(),
          };
        } else {
          return {
            ...prev,
            peers: [...prev.peers],
            rooms: [...prev.rooms],
            timestampPeerStates: Date.now(),
          };
        }
      },
  );

  const setPeersReducer$ = onlyWhileAppIsInForeground(appstate$, () =>
    ssbSource.peers$.compose(sampledEvery(2500)),
  ).map(
    (allPeers) =>
      function setPeersReducer(prev: State): State {
        const peers = allPeers.filter(
          ([, data]) => (data.type as any) !== 'room',
        );
        const rooms = allPeers.filter(
          ([, data]) => (data.type as any) === 'room',
        );
        return {...prev, peers, rooms, timestampPeersAndRooms: Date.now()};
      },
  );

  const setStagedPeersReducer$ = onlyWhileAppIsInForeground(appstate$, () =>
    ssbSource.stagedPeers$.compose(sampledEvery(2500)),
  ).map(
    (allStagedPeers) =>
      function setPeersReducer(prev: State): State {
        const stagedPeers =
          !prev.internetEnabled && prev.lanEnabled
            ? allStagedPeers.filter(
                (p) => p[1].type === 'lan' || p[1].type === 'bt',
              )
            : allStagedPeers;
        return {
          ...prev,
          stagedPeers,
          timestampStagedPeers: Date.now(),
        };
      },
  );

  const openConnMenuReducer$ = actions.openPeerInConnection$.map(
    (peer) =>
      function openConnMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type: 'conn',
            target: peer,
          },
        };
      },
  );

  const openStagingMenuReducer$ = actions.openStagedPeer$.map(
    (peer) =>
      function openStagingMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type:
              (peer[1].type as string) === 'room' ? 'staged-room' : 'staging',
            target: peer,
          },
        };
      },
  );

  const openRoomMenuReducer$ = actions.openRoom$.map(
    (peer) =>
      function openRoomMenuReducer(prev: State): State {
        return {
          ...prev,
          itemMenu: {
            opened: true,
            type: 'room',
            target: peer,
          },
        };
      },
  );

  const closeMenuReducer$ = xs
    .merge(
      actions.closeItemMenu$,
      actions.goToPeerProfile$,
      actions.connectPeer$,
      actions.disconnectPeer$,
      actions.disconnectForgetPeer$,
      actions.forgetPeer$,
      actions.goToManageAliases$,
      actions.shareRoomInvite$,
      actions.signInRoom$,
    )
    .mapTo(function closeMenuReducer(prev: State): State {
      return {
        ...prev,
        itemMenu: {...prev.itemMenu, opened: false},
      };
    });

  return concat(
    propsReducer$,
    xs.merge(
      updateBluetoothEnabled$,
      updateLanEnabled$,
      updateInternetEnabled$,
      updateBluetoothLastScanned$,
      updateConnectionStateReducer$,
      setPeersReducer$,
      setStagedPeersReducer$,
      openConnMenuReducer$,
      openStagingMenuReducer$,
      openRoomMenuReducer$,
      closeMenuReducer$,
    ),
  );
}
