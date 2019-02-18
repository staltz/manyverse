/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {State} from './model';
import {
  IFloatingActionProps as Props,
  IActionProps,
} from 'react-native-floating-action';
import {Palette} from '../../../global-styles/palette';

export default function floatingAction(state$: Stream<State>): Stream<Props> {
  return state$.map(state => {
    const visible = state.bluetoothEnabled || state.internetEnabled;

    const actions: Array<IActionProps> = [];
    if (state.internetEnabled) {
      actions.push(
        {
          color: Palette.backgroundCTA,
          name: 'invite-create',
          icon: require('../../../../../images/share.png'),
          text: 'Create invite',
        },
        {
          color: Palette.backgroundCTA,
          name: 'invite-paste',
          icon: require('../../../../../images/package-down.png'),
          text: 'Paste invite',
        },
      );
    }

    if (state.bluetoothEnabled) {
      actions.push({
        color: Palette.backgroundCTA,
        name: 'bluetooth-search',
        icon: require('../../../../../images/bluetooth.png'),
        text: 'Bluetooth seek',
      });
    }

    return {
      sel: 'fab',
      color: Palette.backgroundCTA,
      visible,
      actions,
      iconHeight: 24,
      iconWidth: 24,
      floatingIcon: require('../../../../../images/plus-network.png'),
    } as Props;
  });
}
