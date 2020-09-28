/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, Listener} from 'xstream';
import Orientation, {OrientationType} from 'react-native-orientation-locker';

export type OrientationEvent = OrientationType;

export function makeOrientationDriver() {
  const response$ = xs
    .create<OrientationEvent>({
      start: function start(listener: Listener<OrientationEvent>) {
        this.fn = (ori: OrientationEvent) => {
          listener.next(ori);
        };
        listener.next(Orientation.getInitialOrientation());
        Orientation.addOrientationListener(this.fn);
        Orientation.getOrientation((ori) => {
          listener.next(ori);
        });
      },

      stop() {
        Orientation.removeOrientationListener(this.fn);
      },
    })
    .remember();

  return function lifecycleDriver(
    _sink$: Stream<never>,
  ): Stream<OrientationEvent> {
    return response$;
  };
}
