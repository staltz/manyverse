/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command as AlertCommand} from 'cycle-native-alert';
import {t} from '../../drivers/localization';
import {State} from './model';

export default function alert(state$: Stream<State>) {
  const informConnectionAttempt$ = state$
    .filter((state) => state.reason === 'connection-attempt')
    .take(1)
    .map(
      () =>
        ({
          title: t('profile.dialog_friend_request.title'),
          message: t('profile.dialog_friend_request.description'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        } as AlertCommand),
    );

  return informConnectionAttempt$;
}
