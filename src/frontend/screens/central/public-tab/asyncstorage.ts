// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {AsyncStorageSource, Command} from 'cycle-native-asyncstorage';

interface Actions {
  updateSessionTimestamp$: Stream<any>;
}

export default function asyncStorage(
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
) {
  const firstVisit$ = asyncStorageSource
    .getItem('firstVisit')
    .filter((resultStr: string | null) => !resultStr)
    .map(
      () =>
        ({
          type: 'setItem',
          key: 'firstVisit',
          value: `${Date.now()}`,
        } as Command),
    );

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

  return xs.merge(latestVisit$, lastSession$, firstVisit$);
}
