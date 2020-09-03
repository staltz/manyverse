/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import delay from 'xstream/extra/delay';
import {Command} from 'cycle-native-asyncstorage';

export default function asyncStorage() {
  return xs
    .of(null)
    .compose(delay(30e3))
    .map(
      () =>
        ({
          type: 'setItem',
          key: 'lastSessionTimestamp',
          value: `${Date.now()}`,
        } as Command),
    );
}
