/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {State} from './model';
import {IFloatingActionProps as Props} from 'react-native-floating-action';
import {Palette} from '../../../global-styles/palette';

export default function floatingAction(state$: Stream<State>): Stream<Props> {
  return state$.map(
    state =>
      ({
        sel: 'fab',
        color: Palette.brand.callToActionBackground,
        visible: state.internetEnabled,
        actions: [
          {
            color: Palette.brand.callToActionBackground,
            name: 'invite-create',
            icon: require('../../../../../images/share.png'),
            text: 'Create invite',
          },

          {
            color: Palette.brand.callToActionBackground,
            name: 'invite-paste',
            icon: require('../../../../../images/package-down.png'),
            text: 'Paste invite',
          },
        ],
        iconHeight: 24,
        iconWidth: 24,
        floatingIcon: require('../../../../../images/plus-network.png'),
      } as Props),
  );
}
