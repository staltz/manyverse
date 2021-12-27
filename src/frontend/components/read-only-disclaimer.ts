// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {DialogSource} from '../drivers/dialogs';
import {t} from '../drivers/localization';
import {Palette} from '../global-styles/palette';

export function readOnlyDisclaimer(dialogSource: DialogSource): Stream<never> {
  return dialogSource
    .alert(
      t('read_only_mode.dialogs.prevent_action.title'),
      t('read_only_mode.dialogs.prevent_action.description'),
      {
        ...Palette.dialogColors,
        positiveText: t('call_to_action.ok'),
        markdownOnDesktop: true,
      },
    )
    .filter((_) => false) as Stream<never>;
}
