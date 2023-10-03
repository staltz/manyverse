// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {DialogSource} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';

export interface Actions {
  openUnrecognizedLinkDialog$: Stream<string>;
}

export default function dialog(actions: Actions, dialogSource: DialogSource) {
  return {
    openUnrecognizedLink$: actions.openUnrecognizedLinkDialog$
      .map((link) =>
        dialogSource
          .alert(
            t('call_to_action.unrecognized_link_confirmation.title'),
            t('call_to_action.unrecognized_link_confirmation.description', {
              link,
            }),
            {
              ...Palette.dialogColors,
              positiveText: t('call_to_action.yes'),
              negativeText: t('call_to_action.no'),
            },
          )
          .filter((res) => res.action === 'actionPositive')
          .mapTo(link),
      )
      .flatten(),
  };
}
