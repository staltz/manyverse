// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Listener, Stream} from 'xstream';
import {ipcRenderer} from 'electron';

export type State = 'active' | 'inactive' | 'background';

export function makeAppStateDriver() {
  const response$ = xs.create<State>({
    start: function start(listener: Listener<State>) {
      this.fn = (first: any, second: any) => {
        const event: 'blur' | 'focus' = second ?? first;
        if (event === 'blur') {
          listener.next('background');
        } else if (event === 'focus') {
          listener.next('active');
        } else {
          console.warn('appStateDriver got bad win-blur-focus event', event);
        }
      };
      ipcRenderer.addListener('win-blur-focus', this.fn);
    },

    stop() {
      ipcRenderer.removeListener('win-blur-focus', this.fn);
    },
  });

  return function appStateDriver(sink$: Stream<never>): Stream<State> {
    return response$;
  };
}
