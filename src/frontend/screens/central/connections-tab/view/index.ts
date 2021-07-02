/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {ScrollView} from 'react-native';
import {styles} from './styles';
import {State} from '../model';
import ConnectivityModes from './ConnectivityModes';
import Body from './Body';
import SlideInMenu from './SlideInMenu';

export default function view(state$: Stream<State>) {
  return state$
    .filter((state) => state.isVisible)
    .compose(
      dropRepeatsByKeys([
        'bluetoothEnabled',
        'bluetoothLastScanned',
        'lanEnabled',
        'internetEnabled',
        'timestampPeersAndRooms',
        'timestampStagedPeers',
        'timestampPeerStates',
        'itemMenu',
      ]),
    )
    .map((state) => {
      return h(
        ScrollView,
        {
          style: styles.container,
          contentContainerStyle: styles.containerInner,
        },
        [h(ConnectivityModes, state), h(Body, state), h(SlideInMenu, state)],
      );
    });
}
