/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {FeedId} from 'ssb-typescript';
import {PermissionsAndroid} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
import {StagedPeerMetadata as StagedPeer} from '../../../drivers/ssb';
import {State} from './model';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
import concat from 'xstream/extra/concat';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
  fabPress$: Stream<string>,
) {
  const back$ = navSource.backPress();
  return {
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

    openStagedPeer$: reactSource
      .select('staged-list')
      .events('pressPeer') as Stream<StagedPeer>,

    closeInviteMenu$: xs
      .merge(
        back$.compose(sample(state$)).filter(state => !!state.inviteMenuTarget),
        reactSource.select('slide-in-menu').events('backdropPress'),
      )
      .mapTo(null),

    goBack$: back$
      .compose(sample(state$))
      .filter(state => !state.inviteMenuTarget)
      .mapTo(null),

    infoClientDhtInvite$: reactSource
      .select('slide-in-menu')
      .events('select')
      .filter(val => val === 'info')
      .compose(sample(state$))
      .filter(state => (state.inviteMenuTarget as StagedPeer).role !== 'server')
      .mapTo(null),

    infoServerDhtInvite$: reactSource
      .select('slide-in-menu')
      .events('select')
      .filter(val => val === 'info')
      .compose(sample(state$))
      .filter(state => (state.inviteMenuTarget as StagedPeer).role === 'server')
      .mapTo(null),

    noteDhtInvite$: reactSource
      .select('slide-in-menu')
      .events('select')
      .filter(val => val === 'note')
      .mapTo(null),

    shareDhtInvite$: reactSource
      .select('slide-in-menu')
      .events('select')
      .filter(val => val === 'share')
      .compose(sample(state$))
      .map(
        state =>
          'dht:' +
          (state.inviteMenuTarget as StagedPeer).key +
          ':' +
          state.selfFeedId,
      ),

    removeDhtInvite$: reactSource
      .select('slide-in-menu')
      .events('select')
      .filter(val => val === 'delete')
      .compose(sample(state$))
      .map(state => (state.inviteMenuTarget as StagedPeer).key),

    goToPeerProfile$: reactSource
      .select('connections-list')
      .events('pressPeer') as Stream<FeedId>,

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
            },
          ),
        ),
      )
      .flatten(),
  };
}
