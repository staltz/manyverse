/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
