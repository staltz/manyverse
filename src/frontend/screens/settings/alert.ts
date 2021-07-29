/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';

export type Actions = {
  toggleDetailedLogs$: Stream<any>;
  updateHops$: Stream<any>;
};

export default function alert(actions: Actions): Stream<AlertCommand> {
  return xs.merge(actions.toggleDetailedLogs$, actions.updateHops$).mapTo({
    type: 'alert',
    title: t('settings.dialogs.restart_required.title'),
    content: t('settings.dialogs.restart_required.description'),
    options: {positiveText: t('call_to_action.ok')},
  });
}
