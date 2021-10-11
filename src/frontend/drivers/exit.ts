// SPDX-FileCopyrightText: 2018-2019 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
