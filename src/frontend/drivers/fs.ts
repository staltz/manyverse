/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import RNFS = require('react-native-fs');

export class FSSource {
  constructor() {}

  public static readonly DocumentDirectoryPath = RNFS.DocumentDirectoryPath;

  public exists(filepath: string): Stream<boolean> {
    return xs.fromPromise(RNFS.exists(filepath));
  }

  public stat(filepath: string): Stream<RNFS.StatResult> {
    return xs.fromPromise(RNFS.stat(filepath));
  }
}

export function makeFSDriver() {
  return function fsDriver(_sink: Stream<never>): FSSource {
    return new FSSource();
  };
}
