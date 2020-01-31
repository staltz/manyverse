/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {State} from './model';
import {IFloatingActionProps as Props} from 'react-native-floating-action';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';

export default function floatingAction(state$: Stream<State>): Stream<Props> {
  return state$.map(
    state =>
      ({
        sel: 'fab',
        color: Palette.backgroundCTA,
        visible: !!state.getPrivateFeedReadable,
        actions: [
          {
            color: Palette.backgroundCTA,
            name: 'recipients-input',
            icon: require('../../../../../images/message-plus.png'),
            text: 'New private conversation',
          },
        ],
        overrideWithAction: true,
        iconHeight: 24,
        iconWidth: 24,
        overlayColor: Palette.transparencyDark,
        distanceToEdge: {
          vertical: Dimensions.verticalSpaceLarge,
          horizontal: Dimensions.horizontalSpaceBig,
        } as any,
      } as Props),
  );
}
