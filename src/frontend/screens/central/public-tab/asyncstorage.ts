// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {setItem} from '~frontend/drivers/asyncstorage';

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
    .map(() => setItem('firstVisit', `${Date.now()}`));

  const latestVisit$ = xs.of(setItem('latestVisit', `${Date.now()}`));

  const lastSession$ = actions.updateSessionTimestamp$.map(() =>
    setItem('lastSessionTimestamp', `${Date.now()}`),
  );

  return xs.merge(latestVisit$, lastSession$, firstVisit$);
}
