// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';

export interface Actions {
  openUriBeforeReady$: Stream<any>;
}

export default function alert(actions: Actions): Stream<AlertCommand> {
  const alertAccountNotReadyForLinks$ = actions.openUriBeforeReady$.map(() => ({
    type: 'alert' as const,
    title: t('welcome.dialogs.link_failed.title'),
    content: t('welcome.dialogs.link_failed.description'),
    options: {
      ...Palette.dialogColors,
      positiveColor: Palette.textDialogStrong,
      positiveText: t('call_to_action.ok'),
    },
  }));

  return alertAccountNotReadyForLinks$;
}
