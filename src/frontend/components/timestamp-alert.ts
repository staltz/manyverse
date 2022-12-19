// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Palette} from '~frontend/global-styles/palette';
import {Command} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';

export default function timestampAlert(timestamp: number): Command {
  return {
    type: 'alert',
    title: t('message.timestamp.title'),
    content: new Date(timestamp).toLocaleString(),
    options: {
      ...Palette.dialogColors,
      positiveColor: Palette.textDialogStrong,
      positiveText: t('call_to_action.ok'),
    },
  };
}
