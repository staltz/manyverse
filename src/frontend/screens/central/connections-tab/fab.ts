// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Images} from '~frontend/global-styles/images';
import {t} from '~frontend/drivers/localization';
import {FabProps} from '../fab';
import {FAB_VERTICAL_DISTANCE_TO_EDGE} from '../styles';

export default function floatingAction(): Stream<FabProps> {
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
      vertical: FAB_VERTICAL_DISTANCE_TO_EDGE,
      horizontal: Dimensions.horizontalSpaceBig,
    },
    floatingIcon: Images.plusNetwork,
  });
}
