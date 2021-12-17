// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Listener} from 'xstream';
import concat from 'xstream/extra/concat';
import {Linking} from 'react-native';
const {ipcRenderer} = require('electron');

export function linkingDriver(url$: Stream<string>): Stream<string> {
  url$.addListener({
    next: (url) => {
      Linking.openURL(url).catch((err) => {
        console.error(err);
      });
    },
  });

  return concat(
    xs.fromPromise<string | null>(ipcRenderer.invoke('incoming-url-first')),

    xs.create({
      start: (listener: Listener<string>) => {
        this.fn = (first: any, second: any) => {
          const url = second ?? first;
          listener.next(url);
        };
        ipcRenderer.addListener('incoming-url', this.fn);
      },
      stop: () => {
        ipcRenderer.removeListener('incoming-url', this.fn);
      },
    }),
  ).filter((s: string | null) => !!s) as Stream<string>;
}
