// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
