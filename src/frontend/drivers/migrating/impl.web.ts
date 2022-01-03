// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Listener, Stream} from 'xstream';
import {ipcRenderer} from 'electron';

export function makeMigratingDriver() {
  return function migratingDriver(sink$: Stream<never>): Stream<number> {
    return xs
      .create({
        start(listener: Listener<number>) {
          this.fn = (first: any, second: any) => {
            const url = second ?? first;
            listener.next(url);
          };
          ipcRenderer.addListener('ssb-migrate-progress', this.fn);
        },
        stop() {
          ipcRenderer.removeListener('ssb-migrate-progress', this.fn);
        },
      })
      .startWith(0);
  };
}
