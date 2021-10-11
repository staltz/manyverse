// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-asyncstorage';

type Actions = {
  updateSessionTimestamp$: Stream<any>;
};

export default function asyncStorage(actions: Actions) {
  const latestVisit$ = xs.of({
    type: 'setItem',
    key: 'latestVisit',
    value: `${Date.now()}`,
  } as Command);

  const lastSession$ = actions.updateSessionTimestamp$.map(
    () =>
      ({
        type: 'setItem',
        key: 'lastSessionTimestamp',
        value: `${Date.now()}`,
      } as Command),
  );

  return xs.merge(latestVisit$, lastSession$);
}
