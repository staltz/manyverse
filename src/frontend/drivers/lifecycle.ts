// SPDX-FileCopyrightText: 2018-2019 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
