// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {State} from './model';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {t} from '~frontend/drivers/localization';
import {Images} from '~frontend/global-styles/images';
import {Props as FabProps} from '~frontend/components/FloatingActionButton';
import {FAB_VERTICAL_DISTANCE_TO_EDGE} from '../styles';

export default function floatingAction(
  state$: Stream<State>,
): Stream<FabProps> {
  return state$.map(
    (state): FabProps => ({
      sel: 'fab',
      color: state.hasComposeDraft
        ? Palette.backgroundWarningAction
        : Palette.backgroundCTA,
      visible: !!state.selfFeedId && state.canPublishSSB,
      actions: [
        {
          color: Palette.backgroundCTA,
          name: 'compose',
          icon: Images.pencil,
          text: t('public.floating_action_button.compose'),
        },
      ],
      title: t('profile.floating_action_button.compose'),
      distanceToEdge: {
        vertical: FAB_VERTICAL_DISTANCE_TO_EDGE,
        horizontal: Dimensions.horizontalSpaceBig,
      },
    }),
  );
}
