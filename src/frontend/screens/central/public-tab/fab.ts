// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {State} from './model';
import {IFloatingActionProps as Props} from 'react-native-floating-action';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {t} from '../../../drivers/localization';
import {getImg} from '../../../global-styles/utils';

export default function floatingAction(state$: Stream<State>): Stream<Props> {
  return state$.map(
    (state) =>
      ({
        sel: 'fab',
        color: state.hasComposeDraft
          ? Palette.backgroundWarningAction
          : Palette.backgroundCTA,
        visible: !!state.selfFeedId && state.canPublishSSB,
        actions: [
          {
            color: Palette.backgroundCTA,
            name: 'compose',
            icon: getImg(require('../../../../../images/pencil.png')),
            text: t('public.floating_action_button.compose'),
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
