// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {State} from './model';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {t} from '~frontend/drivers/localization';
import {Images} from '~frontend/global-styles/images';
import {FabProps} from '../fab';
import {FAB_VERTICAL_DISTANCE_TO_EDGE} from '../styles';

export default function floatingAction(
  state$: Stream<State>,
): Stream<FabProps> {
  return state$.map((state) => ({
    sel: 'fab',
    color: Palette.backgroundCTA,
    visible: !!state.getPrivateFeedReadable,
    actions: [
      {
        color: Palette.backgroundCTA,
        name: 'recipients-input',
        icon: Images.messagePlus,
        text: t('private.floating_action_button.compose'),
      },
    ],
    title: t('private.floating_action_button.compose'),
    overrideWithAction: true,
    iconHeight: 24,
    iconWidth: 24,
    overlayColor: Palette.transparencyDark,
    distanceToEdge: {
      vertical: FAB_VERTICAL_DISTANCE_TO_EDGE,
      horizontal: Dimensions.horizontalSpaceBig,
    },
  }));
}
