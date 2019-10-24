/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import SplashScreen from 'react-native-splash-screen';

export type SplashCommand = 'hide';

export function makeSplashScreenDriver() {
  return function splashScreenDriver(sink: Stream<SplashCommand>): void {
    sink.addListener({
      next() {
        SplashScreen.hide();
      },
    });
  };
}
