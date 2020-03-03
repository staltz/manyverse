/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from 'cycle-native-alert';

export type Actions = {
  toggleDetailedLogs$: Stream<any>;
  updateHops$: Stream<any>;
};

export default function alert(actions: Actions): Stream<AlertCommand> {
  return xs.merge(actions.toggleDetailedLogs$, actions.updateHops$).mapTo({
    title: 'Restart required',
    message:
      'This setting will only enter into effect ' +
      'when you kill the app and restart Manyverse.',
    buttons: [{text: 'OK', id: 'okay'}],
  });
}
