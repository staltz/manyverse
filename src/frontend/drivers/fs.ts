/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import RNFS = require('react-native-fs');

type UnwrapPromise<T> = T extends Promise<infer A> ? A : never;
type In<T extends (...args: any) => any> = Parameters<T>;
type Out<T extends (...args: any) => any> = Stream<
  UnwrapPromise<ReturnType<T>>
>;

export class FSSource {
  constructor() {}

  public static readonly DocumentDirectoryPath = RNFS.DocumentDirectoryPath;
  public static readonly MainBundlePath = RNFS.MainBundlePath;

  public exists(...args: In<typeof RNFS.exists>): Out<typeof RNFS.exists> {
    return xs.fromPromise(RNFS.exists(...args));
  }

  public stat(...args: In<typeof RNFS.stat>): Out<typeof RNFS.stat> {
    return xs.fromPromise(RNFS.stat(...args));
  }

  public readDir(...args: In<typeof RNFS.readDir>): Out<typeof RNFS.readDir> {
    return xs.fromPromise(RNFS.readDir(...args));
  }

  public readDirAssets(
    ...args: In<typeof RNFS.readDirAssets>
  ): Out<typeof RNFS.readDirAssets> {
    return xs.fromPromise(RNFS.readDirAssets(...args));
  }

  public readFile(
    ...args: In<typeof RNFS.readFile>
  ): Out<typeof RNFS.readFile> {
    return xs.fromPromise(RNFS.readFile(...args));
  }

  public readFileAssets(
    ...args: In<typeof RNFS.readFileAssets>
  ): Out<typeof RNFS.readFileAssets> {
    return xs.fromPromise(RNFS.readFileAssets(...args));
  }
}

export function makeFSDriver() {
  return function fsDriver(_sink: Stream<never>): FSSource {
    return new FSSource();
  };
}
