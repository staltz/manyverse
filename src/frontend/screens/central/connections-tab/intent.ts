/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {FeedId} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';
import {State, StagedPeer} from './model';
import sample from 'xstream-sample';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
  fabPress$: Stream<string>,
) {
  const back$ = navSource.backPress();
  return {
    showLANHelp$: reactSource.select('lan-mode').events('press'),

    showDHTHelp$: reactSource.select('dht-mode').events('press'),

    showPubHelp$: reactSource.select('pub-mode').events('press'),

    openStagedPeer$: reactSource
      .select('staged-list')
      .events('pressPeer') as Stream<StagedPeer>,

    closeInviteMenu$: back$
      .compose(sample(state$))
      .filter(state => !!state.inviteMenuTarget)
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
  };
}
