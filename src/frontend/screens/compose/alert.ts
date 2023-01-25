// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {composeErrorAlert} from '~frontend/drivers/dialogs/sharedCommands';

export interface Actions {
  showTooLargeAttachmentError$: Stream<any>;
  showTooLargeTextError$: Stream<any>;
}

export default function alert(actions: Actions): Stream<AlertCommand> {
  return xs.merge(
    actions.showTooLargeAttachmentError$.mapTo({
      type: 'alert',
      title: t('compose.alert_compose_error.attachment_size.title'),
      content: t('compose.alert_compose_error.attachment_size.description'),
      options: {
        ...Palette.dialogColors,
        positiveColor: Palette.textDialogStrong,
        positiveText: t('call_to_action.ok'),
        markdownOnDesktop: true,
      },
    } as AlertCommand),

    actions.showTooLargeTextError$.mapTo(composeErrorAlert()),
  );
}
