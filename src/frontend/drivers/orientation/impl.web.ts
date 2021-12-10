// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {OrientationEvent} from './types';

export function makeOrientationDriver() {
  return function lifecycleDriver(
    _sink$: Stream<never>,
  ): Stream<OrientationEvent> {
    return xs.of('LANDSCAPE-RIGHT');
  };
}
