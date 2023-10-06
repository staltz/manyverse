// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Palette} from '~frontend/global-styles/palette';
import {Images} from '~frontend/global-styles/images';
import {Props as FabProps} from '~frontend/components/FloatingActionButton';
import {t} from '~frontend/drivers/localization';
import {State} from './model';

export function floatingAction(state$: Stream<State>): Stream<FabProps> {
  return state$.map(
    (state): FabProps => ({
      sel: 'fab',
      color: state.hasComposeDraft
        ? Palette.backgroundWarningAction
        : Palette.backgroundCTA,
      visible:
        state.query.startsWith('#') &&
        state.query.length > 2 &&
        !!state.selfFeedId,
      actions: [
        {
          color: Palette.backgroundCTA,
          name: 'compose',
          icon: Images.pencil,
          text: t('public.floating_action_button.compose'),
        },
      ],
      overrideWithAction: true,
      title: t('profile.floating_action_button.compose'),
    }),
  );
}
