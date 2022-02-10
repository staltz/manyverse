// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import concat from 'xstream/extra/concat';
import {ReactSource} from '@cycle/react';
import {FeedId} from 'ssb-typescript';
import {PermissionsAndroid} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
const roomUtils = require('ssb-room-client/utils');
import {StagedPeerKV, PeerKV} from '~frontend/ssb/types';
import {t} from '~frontend/drivers/localization';
import {State} from './model';
import {MenuChoice} from './connDialogs';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
  menuChoice$: Stream<MenuChoice>,
) {
  const goBack$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const fabPress$ = reactSource.select('fab').events('pressItem');

  return {
    //#region Header actions

    pingConnectivityModes$: concat(
      xs.of(0),
      xs.periodic(2000).take(2),
      xs.periodic(6000),
    ),

    showBluetoothHelp$: reactSource.select('bluetooth-mode').events('press'),

    showLANHelp$: reactSource.select('lan-mode').events('press'),

    showPubHelp$: reactSource.select('pub-mode').events('press'),

    //#endregion

    //#region Item menu actions

    openPeerInConnection$: reactSource
      .select('list-of-peers')
      .events<PeerKV>('pressPeer'),

    openRoom$: reactSource.select('list-of-peers').events<PeerKV>('pressRoom'),

    openStagedPeer$: reactSource.select('list-of-peers').events('pressStaged'),

    goToPeerProfile$: menuChoice$
      .filter((val) => val === 'open-profile')
      .compose(sample(state$))
      .map(
        (state) =>
          (state.itemMenu.target as PeerKV | StagedPeerKV)[1].key as FeedId,
      ),

    goToManageAliases$: menuChoice$.filter((val) => val === 'manage-aliases'),

    connectPeer$: menuChoice$
      .filter((val) => val === 'connect')
      .compose(sample(state$))
      .map((state) => state.itemMenu.target) as Stream<StagedPeerKV>,

    disconnectPeer$: menuChoice$
      .filter((val) => val === 'disconnect')
      .compose(sample(state$))
      .map((state) => (state.itemMenu.target as PeerKV)[0]),

    disconnectForgetPeer$: menuChoice$
      .filter((val) => val === 'disconnect-forget')
      .compose(sample(state$))
      .map((state) => (state.itemMenu.target as PeerKV)[0]),

    forgetPeer$: menuChoice$
      .filter((val) => val === 'forget')
      .compose(sample(state$))
      .map((state) => (state.itemMenu.target as PeerKV)[0]),

    signInRoom$: menuChoice$
      .filter((val) => val === 'room-sign-in')
      .compose(sample(state$))
      .map((state) => state.itemMenu.target) as Stream<PeerKV>,

    shareRoomInvite$: menuChoice$
      .filter((val) => val === 'room-share-invite')
      .compose(sample(state$))
      .map((state) => {
        const peer = state.itemMenu.target as PeerKV;
        return {
          invite: roomUtils.addressToInvite(peer[0]),
          room: (peer[1].name as string) ?? peer[0],
        };
      }),

    closeItemMenu$: xs
      .merge(
        goBack$
          .compose(sample(state$))
          .filter((state) => state.itemMenu.opened),
        reactSource.select('slide-in-menu').events('backdropPress'),
      )
      .mapTo(null),

    goBack$: goBack$
      .compose(sample(state$))
      .filter((state) => !state.itemMenu.opened)
      .mapTo(null),

    //#endregion

    //#region FAB actions

    goToPasteInvite$: fabPress$.filter((action) => action === 'invite-paste'),

    bluetoothSearch$: fabPress$
      .filter((action) => action === 'bluetooth-search')
      .map(() =>
        xs.fromPromise(
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: t('connections.modes.bluetooth.permission_request.title'),
              message: t(
                'connections.modes.bluetooth.permission_request.message',
              ),
              buttonPositive: t('call_to_action.yes'),
              buttonNegative: t('call_to_action.no'),
            },
          ),
        ),
      )
      .flatten(),

    //#endregion
  };
}
