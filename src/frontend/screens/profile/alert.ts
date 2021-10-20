// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command as AlertCommand} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {State} from './model';

export default function alert(state$: Stream<State>): Stream<AlertCommand> {
  const informConnectionAttempt$ = state$
    .filter((state) => state.reason === 'connection-attempt')
    .take(1)
    .map(() => ({
      type: 'alert' as const,
      title: t('profile.dialog_friend_request.title'),
      content: t('profile.dialog_friend_request.description'),
      options: {
        ...Palette.dialogColors,
        positiveColor: Palette.textDialogStrong,
        positiveText: t('call_to_action.ok'),
      },
    }));

  return informConnectionAttempt$;
}
