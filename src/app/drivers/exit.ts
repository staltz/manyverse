/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {BackHandler} from 'react-native';

export function makeExitDriver() {
  return function exitDriver(sink: Stream<any>): void {
    sink.subscribe({
      next: () => {
        BackHandler.exitApp();
      },
    });
  };
}
