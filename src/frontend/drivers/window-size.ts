/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, Listener} from 'xstream';
import {Dimensions, ScaledSize} from 'react-native';

export function makeWindowSizeDriver() {
  const response$ = xs.createWithMemory<ScaledSize>({
    start(listener: Listener<ScaledSize>) {
      this.handler = (sizes: {window: ScaledSize}) =>
        listener.next(sizes.window);
      Dimensions.addEventListener('change', this.handler);
      listener.next(Dimensions.get('window'));
    },
    stop() {
      Dimensions.removeEventListener('change', this.handler);
    },
  });

  return function windowSizeDriver(_sink$: Stream<never>): Stream<ScaledSize> {
    return response$;
  };
}
