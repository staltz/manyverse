// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
