// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';

export interface Actions {
  updateHops$: Stream<any>;
  toggleAllowCrashReports$: Stream<any>;
  toggleDetailedLogs$: Stream<any>;
}

export default function alert(actions: Actions): Stream<AlertCommand> {
  const restartAlert$ = xs
    .merge(
      actions.updateHops$,
      actions.toggleAllowCrashReports$,
      actions.toggleDetailedLogs$,
    )
    .mapTo({
      type: 'alert',
      title: t('settings.dialogs.restart_required.title'),
      content: t('settings.dialogs.restart_required.description'),
      options: {
        ...Palette.dialogColors,
        positiveColor: Palette.textDialogStrong,
        positiveText: t('call_to_action.ok'),
      },
    } as AlertCommand);

  return restartAlert$;
}
