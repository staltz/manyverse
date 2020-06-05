/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, Listener} from 'xstream';
import {AppState} from 'react-native';

export type State = 'active' | 'inactive' | 'background';

export function makeAppStateDriver() {
  const response$ = xs.create<State>({
    start: function start(listener: Listener<string>) {
      this.current = AppState.currentState;
      this.fn = (nextAppState: State) => {
        if (nextAppState !== this.current) {
          this.current = nextAppState;
          listener.next(nextAppState);
        }
      };
      AppState.addEventListener('change', this.fn);
    },

    stop() {
      AppState.removeEventListener('change', this.fn);
    },
  });

  return function appStateDriver(sink$: Stream<never>): Stream<State> {
    return response$;
  };
}
