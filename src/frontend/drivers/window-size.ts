// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Listener} from 'xstream';
import {Dimensions} from 'react-native';

export interface WindowSize {
  width: number;
  height: number;
}

export function makeWindowSizeDriver() {
  const response$ = xs.createWithMemory<WindowSize>({
    start(listener: Listener<WindowSize>) {
      this.handler = (sizes: {window: WindowSize}) =>
        listener.next(sizes.window);
      Dimensions.addEventListener('change', this.handler);
      listener.next(Dimensions.get('window'));
    },
    stop() {
      Dimensions.removeEventListener('change', this.handler);
    },
  });

  return function windowSizeDriver(_sink$: Stream<never>): Stream<WindowSize> {
    return response$;
  };
}
