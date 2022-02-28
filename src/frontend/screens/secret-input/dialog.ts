// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {SSBSource, RestoreIdentityResponse} from '~frontend/drivers/ssb';
import {DialogSource} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {State} from './model';

interface Actions {
  confirm$: Stream<any>;
}

function renderContent(response: RestoreIdentityResponse): string {
  const TRY_AGAIN = t(
    'secret_input.dialogs.restore.incorrect.description.try_again',
  );

  const OVERWRITE_RISK = t(
    'secret_input.dialogs.restore.incorrect.description.overwrite_risk',
  );

  const TOO_SHORT =
    t('secret_input.dialogs.restore.incorrect.description.too_short') +
    '\n\n' +
    TRY_AGAIN;

  const TOO_LONG =
    t('secret_input.dialogs.restore.incorrect.description.too_long') +
    '\n\n' +
    TRY_AGAIN;

  const WRONG_LENGTH =
    t('secret_input.dialogs.restore.incorrect.description.wrong_length') +
    '\n\n' +
    TRY_AGAIN;

  const INCORRECT =
    t('secret_input.dialogs.restore.incorrect.description.generic') +
    '\n\n' +
    TRY_AGAIN;

  switch (response) {
    case 'IDENTITY_READY':
      throw new Error('Unreachable');
    case 'INCORRECT':
      return INCORRECT;
    case 'OVERWRITE_RISK':
      return OVERWRITE_RISK;
    case 'WRONG_LENGTH':
      return WRONG_LENGTH;
    case 'TOO_LONG':
      return TOO_LONG;
    case 'TOO_SHORT':
      return TOO_SHORT;
    default:
      return INCORRECT;
  }
}

export default function dialog(
  actions: Actions,
  state$: Stream<State>,
  ssbSource: SSBSource,
  dialogSource: DialogSource,
) {
  const practiceModeConfirmation$ = actions.confirm$
    .compose(sample(state$))
    .filter((state) => state.practiceMode === true)
    .map(
      (state) =>
        state.backendWords ===
        state.inputWords
          .split(' ')
          .slice(0, 24)
          .map((s) => s.trim().toLowerCase())
          .join(' '),
    )
    .map((passed) =>
      dialogSource
        .alert(
          passed
            ? t('secret_input.dialogs.practice.correct.title')
            : t('secret_input.dialogs.practice.incorrect.title'),
          passed
            ? t('secret_input.dialogs.practice.correct.description')
            : t('secret_input.dialogs.practice.incorrect.description'),
          {
            ...Palette.dialogColors,
            positiveColor: Palette.textDialogStrong,
            positiveText: t('call_to_action.ok'),
          },
        )
        .mapTo(passed),
    )
    .flatten();

  const realRecoveryConfirmation$ = actions.confirm$
    .compose(sample(state$))
    .filter((state) => state.practiceMode === false)
    .map((state) => ssbSource.restoreIdentity$(state.inputWords))
    .flatten()
    .map((response) => {
      if (response === 'IDENTITY_READY') {
        return xs.of(true);
      } else {
        return dialogSource
          .alert(
            t('secret_input.dialogs.restore.incorrect.title'),
            renderContent(response),
            {
              ...Palette.dialogColors,
              positiveColor: Palette.textDialogStrong,
              positiveText: t('call_to_action.ok'),
            },
          )
          .mapTo(false);
      }
    })
    .flatten();

  return xs.merge(practiceModeConfirmation$, realRecoveryConfirmation$);
}
