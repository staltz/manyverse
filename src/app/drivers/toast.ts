/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ToastAndroid, Platform} from 'react-native';

export type Toast = {
  type: 'show';
  message: string;
  duration: number;
};

export type GravityToast = {
  type: 'showWithGravity';
  message: string;
  duration: number;
  gravity: number;
};

export const Duration = {
  SHORT: ToastAndroid.SHORT,
  LONG: ToastAndroid.LONG,
};

export const Gravity = {
  TOP: ToastAndroid.TOP,
  CENTER: ToastAndroid.CENTER,
  BOTTOM: ToastAndroid.BOTTOM,
};

export function makeToastDriver() {
  return function toastDriver(sink: Stream<Toast | GravityToast>): void {
    if (Platform.OS === 'android') {
      sink.addListener({
        next: t => {
          const args = [
            t.message,
            t.duration,
            (t as GravityToast).gravity,
          ].filter(x => typeof x !== 'undefined');
          (ToastAndroid[t.type] as any)(...args);
        },
      });
    }
  };
}
