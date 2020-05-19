/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from 'cycle-native-alert';
import {t} from '../../drivers/localization';

export type Actions = {
  toggleDetailedLogs$: Stream<any>;
  updateHops$: Stream<any>;
};

export default function alert(actions: Actions): Stream<AlertCommand> {
  return xs.merge(actions.toggleDetailedLogs$, actions.updateHops$).mapTo({
    title: t('settings.dialogs.restart_required.title'),
    message: t('settings.dialogs.restart_required.description'),
    buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
  });
}
