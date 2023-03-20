// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {setItem} from '~frontend/drivers/asyncstorage';

interface Actions {
  deleteAccount$: Stream<any>;
  toggleAllowCheckingNewVersion$: Stream<boolean>;
}

export default function asyncStorage(actions: Actions) {
  const enableCheckingNewVersion$ = actions.toggleAllowCheckingNewVersion$.map(
    (allow) => setItem('allowCheckingNewVersion', JSON.stringify(allow)),
  );

  const clearAsyncStorage$ = actions.deleteAccount$.mapTo({
    type: 'clear' as const,
  });

  return xs.merge(enableCheckingNewVersion$, clearAsyncStorage$);
}
