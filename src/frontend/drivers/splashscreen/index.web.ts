// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';

export function makeSplashScreenDriver() {
  return function splashScreenDriver(sink: Stream<any>): void {
    // No need to implement this because the splash screen is in HTML/CSS
    // and will be automatically overriden by React (web) once the App mounts.
  };
}
