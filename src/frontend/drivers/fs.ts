/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform} from 'react-native';
import xs, {Stream} from 'xstream';
const FS = Platform.OS === 'web' ? require('fs') : require('react-native-fs');
// TODO: bring back typescript types for FS

type UnwrapPromise<T> = T extends Promise<infer A> ? A : never;
type In<T extends (...args: any) => any> = Parameters<T>;
type Out<T extends (...args: any) => any> = Stream<
  UnwrapPromise<ReturnType<T>>
>;

export class FSSource {
  constructor() {}

  public static readonly DocumentDirectoryPath = FS.DocumentDirectoryPath;
  public static readonly MainBundlePath = FS.MainBundlePath;
  public static readonly CachesDirectoryPath = FS.CachesDirectoryPath;

  public exists(...args: In<typeof FS.exists>): Out<typeof FS.exists> {
    if (Platform.OS === 'web') {
      return xs.of(FS.existsSync(...args));
    } else {
      return xs.fromPromise(FS.exists(...args));
    }
  }

  public stat(...args: In<typeof FS.stat>): Out<typeof FS.stat> {
    if (Platform.OS === 'web') {
      return xs.fromPromise(FS.promises.stat(...args));
    } else {
      return xs.fromPromise(FS.stat(...args));
    }
  }

  public readDir(...args: In<typeof FS.readDir>): Out<typeof FS.readDir> {
    if (Platform.OS === 'web') {
      return xs.fromPromise(FS.promises.readdir(...args));
    } else {
      return xs.fromPromise(FS.readDir(...args));
    }
  }

  public readDirAssets(
    ...args: In<typeof FS.readDirAssets>
  ): Out<typeof FS.readDirAssets> {
    return xs.fromPromise(FS.readDirAssets(...args));
  }

  public readFile(...args: In<typeof FS.readFile>): Out<typeof FS.readFile> {
    if (Platform.OS === 'web') {
      return xs.fromPromise(FS.promises.readFile(...args));
    } else {
      return xs.fromPromise(FS.readFile(...args));
    }
  }

  public readFileAssets(
    ...args: In<typeof FS.readFileAssets>
  ): Out<typeof FS.readFileAssets> {
    return xs.fromPromise(FS.readFileAssets(...args));
  }

  public unlink(...args: In<typeof FS.unlink>): Out<typeof FS.unlink> {
    if (Platform.OS === 'web') {
      return xs.fromPromise(FS.promises.unlink(...args));
    } else {
      return xs.fromPromise(FS.unlink(...args));
    }
  }

  public moveFile(...args: In<typeof FS.moveFile>): Out<typeof FS.moveFile> {
    return xs.fromPromise(FS.moveFile(...args));
  }
}

export function makeFSDriver() {
  return function fsDriver(sink: Stream<any>): FSSource {
    // just subscribe to "enable" the chain of streams
    sink.addListener({next: () => {}});
    return new FSSource();
  };
}
