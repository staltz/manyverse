// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {State} from './model';
import {
  IFloatingActionProps as Props,
  IActionProps,
} from 'react-native-floating-action';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {t} from '../../../drivers/localization';
import {getImg} from '../../../global-styles/utils';
import {Platform} from 'react-native';

const ACTION_MARGIN_DESKTOP = 45; // px

export default function floatingAction(state$: Stream<State>): Stream<Props> {
  return state$.map((state) => {
    const visible = state.bluetoothEnabled || state.internetEnabled;

    const actions: Array<IActionProps> = [];
    if (state.internetEnabled) {
      actions.push({
        color: Palette.backgroundCTA,
        name: 'invite-paste',
        margin: Platform.OS === 'web' ? ACTION_MARGIN_DESKTOP : undefined,
        icon: getImg(require('../../../../../images/package-down.png')),
        text: t('connections.floating_action_button.paste_invite'),
      });
    }

    if (state.bluetoothEnabled) {
      actions.push({
        color: Palette.backgroundCTA,
        name: 'bluetooth-search',
        margin: Platform.OS === 'web' ? ACTION_MARGIN_DESKTOP : undefined,
        icon: getImg(require('../../../../../images/bluetooth.png')),
        text: t('connections.floating_action_button.bluetooth_seek'),
      });
    }

    return {
      sel: 'fab',
      color: Palette.backgroundCTA,
      visible,
      actions,
      iconHeight: 24,
      iconWidth: 24,
      overlayColor: Palette.transparencyDark,
      distanceToEdge: {
        vertical: Dimensions.verticalSpaceLarge,
        horizontal: Dimensions.horizontalSpaceBig,
      } as any,
      floatingIcon: getImg(require('../../../../../images/plus-network.png')),
    } as Props;
  });
}
