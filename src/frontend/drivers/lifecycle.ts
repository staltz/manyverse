/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, Listener} from 'xstream';
import {DeviceEventEmitter} from 'react-native';

export type LifecycleEvent = 'paused' | 'resumed';

export function makeActivityLifecycleDriver() {
  const response$ = xs.create<LifecycleEvent>({
    start: function start(listener: Listener<string>) {
      this.fn = (type: string) => {
        listener.next(type);
      };
      DeviceEventEmitter.addListener('activityLifecycle', this.fn);
    },

    stop() {
      DeviceEventEmitter.removeListener('activityLifecycle', this.fn);
    },
  });

  return function lifecycleDriver(
    sink$: Stream<never>,
  ): Stream<LifecycleEvent> {
    return response$;
  };
}
