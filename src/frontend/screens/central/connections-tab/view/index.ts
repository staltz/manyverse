// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {ScrollView} from 'react-native';
import {styles} from './styles';
import {State} from '../model';
import ConnectivityModes from './ConnectivityModes';
import Body from './Body';

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
      ]),
    )
    .map((state) => {
      return h(
        ScrollView,
        {
          style: styles.container,
          contentContainerStyle: styles.containerInner,
        },
        [h(ConnectivityModes, state), h(Body, state)],
      );
    });
}
