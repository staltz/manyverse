/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {SSBSource, RestoreIdentityResponse} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {State} from './model';

type Actions = {
  confirm$: Stream<any>;
};

function renderContent(response: RestoreIdentityResponse): string {
  const CORRECT = t('secret_input.dialogs.restore.correct.description');

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

  return response === 'IDENTITY_READY'
    ? CORRECT
    : response === 'INCORRECT'
    ? INCORRECT
    : response === 'OVERWRITE_RISK'
    ? OVERWRITE_RISK
    : response === 'WRONG_LENGTH'
    ? WRONG_LENGTH
    : response === 'TOO_LONG'
    ? TOO_LONG
    : response === 'TOO_SHORT'
    ? TOO_SHORT
    : INCORRECT;
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
      const passed = response === 'IDENTITY_READY';
      return dialogSource
        .alert(
          passed
            ? t('secret_input.dialogs.restore.correct.title')
            : t('secret_input.dialogs.restore.incorrect.title'),
          renderContent(response),
        )
        .mapTo(passed);
    })
    .flatten();

  return xs.merge(practiceModeConfirmation$, realRecoveryConfirmation$);
}
