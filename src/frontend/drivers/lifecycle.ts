// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Listener} from 'xstream';
import {DeviceEventEmitter} from 'react-native';

export type LifecycleEvent = 'paused' | 'resumed';

export function makeActivityLifecycleDriver() {
  const response$ = xs.create<LifecycleEvent>({
    start: function start(listener: Listener<string>) {
      this.sub = DeviceEventEmitter.addListener(
        'activityLifecycle',
        (type: string) => listener.next(type),
      );
    },

    stop() {
      this.sub?.remove();
    },
  });

  return function lifecycleDriver(
    sink$: Stream<never>,
  ): Stream<LifecycleEvent> {
    return response$;
  };
}
