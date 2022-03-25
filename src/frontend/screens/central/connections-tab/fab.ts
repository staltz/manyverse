// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {State} from './model';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {getImg} from '~frontend/global-styles/utils';
import {FabProps} from '../fab';
import {t} from '~frontend/drivers/localization';

export default function floatingAction(
  state$: Stream<State>,
): Stream<FabProps> {
  return xs.of({
    sel: 'fab',
    color: Palette.backgroundCTA,
    visible: false,
    actions: [],
    iconHeight: 24,
    iconWidth: 24,
    overlayColor: Palette.transparencyDark,
    title: t('connections.floating_action_button.add_connection'),
    distanceToEdge: {
      vertical: Dimensions.verticalSpaceLarge,
      horizontal: Dimensions.horizontalSpaceBig,
    },
    floatingIcon: getImg(require('~images/plus-network.png')),
  });
}
