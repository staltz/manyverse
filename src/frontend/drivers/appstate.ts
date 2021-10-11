// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
