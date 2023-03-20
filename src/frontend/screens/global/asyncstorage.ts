// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {setItem} from '~frontend/drivers/asyncstorage';
import {AlertAction} from '~frontend/drivers/dialogs';

interface Actions {
  approvedCheckingNewVersion$: Stream<AlertAction>;
  rejectedCheckingNewVersion$: Stream<AlertAction>;
  readCheckingNewVersionSetting$: Stream<boolean | null>;
}

export default function asyncStorage(actions: Actions) {
  const readCheckingNewVersionSetting$ =
    actions.readCheckingNewVersionSetting$.filter(
      (value): value is boolean => typeof value === 'boolean',
    );

  const enableCheckingNewVersion$ = xs
    .merge(
      readCheckingNewVersionSetting$.filter((value) => value === true),
      actions.approvedCheckingNewVersion$,
    )
    .mapTo(setItem('allowCheckingNewVersion', JSON.stringify(true)));

  const disableCheckingNewVersion$ = xs
    .merge(
      readCheckingNewVersionSetting$.filter((value) => value === false),
      actions.rejectedCheckingNewVersion$,
    )
    .mapTo(setItem('allowCheckingNewVersion', JSON.stringify(false)));

  return xs.merge(enableCheckingNewVersion$, disableCheckingNewVersion$);
}
