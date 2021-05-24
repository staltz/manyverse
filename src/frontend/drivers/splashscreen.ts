/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import RNBootSplash from 'react-native-bootsplash';

export type SplashCommand = 'hide';

export function makeSplashScreenDriver() {
  return function splashScreenDriver(sink: Stream<SplashCommand>): void {
    sink.addListener({
      next() {
        RNBootSplash.hide({fade: true});
      },
    });
  };
}
