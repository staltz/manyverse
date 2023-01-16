// SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {timestampAlert} from '~frontend/drivers/dialogs/sharedCommands';
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {State} from './model';

interface Actions {
  viewTimestamp$: Stream<number>;
}

export default function alert(
  state$: Stream<State>,
  actions: Actions,
): Stream<AlertCommand> {
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

  const informTimestamp$ = actions.viewTimestamp$.map(timestampAlert);

  return xs.merge(informConnectionAttempt$, informTimestamp$);
}
