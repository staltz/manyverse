// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';

export type Actions = {
  toggleDetailedLogs$: Stream<any>;
  updateHops$: Stream<any>;
};

export default function alert(actions: Actions): Stream<AlertCommand> {
  return xs.merge(actions.toggleDetailedLogs$, actions.updateHops$).mapTo({
    type: 'alert',
    title: t('settings.dialogs.restart_required.title'),
    content: t('settings.dialogs.restart_required.description'),
    options: {
      ...Palette.dialogColors,
      positiveColor: Palette.textDialogStrong,
      positiveText: t('call_to_action.ok'),
    },
  });
}
