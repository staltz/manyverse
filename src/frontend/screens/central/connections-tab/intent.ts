/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
import concat from 'xstream/extra/concat';
import {ReactSource} from '@cycle/react';
import {FeedId} from 'ssb-typescript';
import {PermissionsAndroid} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
import {
  StagedPeerMetadata as StagedPeer,
  StagedPeerKV,
  PeerKV,
} from '../../../ssb/types';
import {State} from './model';
import {MenuChoice} from './view/SlideInMenu';
const roomUtils = require('ssb-room/utils');

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
  fabPress$: Stream<string>,
) {
  const back$ = navSource.backPress();

  const menuChoice$ = reactSource
    .select('slide-in-menu')
    .events('select') as Stream<MenuChoice>;

  return {
    //#region Header actions

    pingConnectivityModes$: state$
      .map(state => state.isVisible)
      .compose(dropRepeats())
      .map(isTabVisible =>
        isTabVisible
          ? concat(xs.of(0), xs.periodic(2000).take(2), xs.periodic(6000))
          : xs.never(),
      )
      .flatten()
      .startWith(null),

    showBluetoothHelp$: reactSource.select('bluetooth-mode').events('press'),

    showLANHelp$: reactSource.select('lan-mode').events('press'),

    showDHTHelp$: reactSource.select('dht-mode').events('press'),

    showPubHelp$: reactSource.select('pub-mode').events('press'),

    //#endregion

    //#region Item menu actions

    openPeerInConnection$: reactSource
      .select('list-of-peers')
      .events('pressPeer') as Stream<PeerKV>,

    openRoom$: reactSource
      .select('list-of-peers')
      .events('pressRoom') as Stream<PeerKV>,

    openStagedPeer$: reactSource
      .select('list-of-peers')
      .events('pressStaged')
      .filter((peer: StagedPeerKV) => peer[1].type !== 'dht'),

    openDHTStagedPeer$: reactSource
      .select('list-of-peers')
      .events('pressStaged')
      .filter((peer: StagedPeerKV) => peer[1].type === 'dht'),

    goToPeerProfile$: menuChoice$
      .filter(val => val === 'open-profile')
      .compose(sample(state$))
      .map(
        state =>
          (state.itemMenu.target as PeerKV | StagedPeerKV)[1].key as FeedId,
      ),

    connectPeer$: menuChoice$
      .filter(val => val === 'connect')
      .compose(sample(state$))
      .map(state => state.itemMenu.target) as Stream<StagedPeerKV>,

    followConnectPeer$: menuChoice$
      .filter(val => val === 'follow-connect')
      .compose(sample(state$))
      .map(state => state.itemMenu.target) as Stream<StagedPeerKV>,

    disconnectPeer$: menuChoice$
      .filter(val => val === 'disconnect')
      .compose(sample(state$))
      .map(state => (state.itemMenu.target as PeerKV)[0]),

    disconnectForgetPeer$: menuChoice$
      .filter(val => val === 'disconnect-forget')
      .compose(sample(state$))
      .map(state => (state.itemMenu.target as PeerKV)[0]),

    forgetPeer$: menuChoice$
      .filter(val => val === 'forget')
      .compose(sample(state$))
      .map(state => (state.itemMenu.target as PeerKV)[0]),

    shareRoomInvite$: menuChoice$
      .filter(val => val === 'room-share-invite')
      .compose(sample(state$))
      .map(state => {
        const peer = state.itemMenu.target as PeerKV;
        return {
          invite: roomUtils.addressToInvite(peer[0]),
          room: (peer[1].name as string) || peer[0],
        };
      }),

    infoClientDhtInvite$: menuChoice$
      .filter(val => val === 'invite-info')
      .compose(sample(state$))
      .filter(state => (state.itemMenu.target as StagedPeer).role !== 'server')
      .mapTo(null),

    infoServerDhtInvite$: menuChoice$
      .filter(val => val === 'invite-info')
      .compose(sample(state$))
      .filter(state => (state.itemMenu.target as StagedPeer).role === 'server')
      .mapTo(null),

    noteDhtInvite$: menuChoice$
      .filter(val => val === 'invite-note')
      .mapTo(null),

    shareDhtInvite$: menuChoice$
      .filter(val => val === 'invite-share')
      .compose(sample(state$))
      .map(
        state =>
          'dht:' +
          (state.itemMenu.target as StagedPeer).key +
          ':' +
          state.selfFeedId,
      ),

    removeDhtInvite$: menuChoice$
      .filter(val => val === 'invite-delete')
      .compose(sample(state$))
      .map(state => (state.itemMenu.target as StagedPeer).key),

    closeItemMenu$: xs
      .merge(
        back$.compose(sample(state$)).filter(state => state.itemMenu.opened),
        reactSource.select('slide-in-menu').events('backdropPress'),
      )
      .mapTo(null),

    goBack$: back$
      .compose(sample(state$))
      .filter(state => !state.itemMenu.opened)
      .mapTo(null),

    //#endregion

    //#region FAB actions

    goToPasteInvite$: fabPress$.filter(action => action === 'invite-paste'),

    goToCreateInvite$: fabPress$.filter(action => action === 'invite-create'),

    bluetoothSearch$: fabPress$
      .filter(action => action === 'bluetooth-search')
      .map(() =>
        xs.fromPromise(
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: 'Allow locating via Bluetooth?',
              message:
                'Manyverse needs to use Bluetooth to discover where you are ' +
                '("coarse location") and what peers are around you.',
              buttonPositive: 'Yes',
              buttonNegative: 'No',
            },
          ),
        ),
      )
      .flatten(),

    //#endregion
  };
}
