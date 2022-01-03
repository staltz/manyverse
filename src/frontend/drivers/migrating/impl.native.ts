// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';

export function makeMigratingDriver() {
  return function migratingDriver(sink$: Stream<never>): Stream<number> {
    return xs.never();
  };
}
