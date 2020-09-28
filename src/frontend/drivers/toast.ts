/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ToastAndroid, Platform} from 'react-native';
const ToastIOS = require('react-native-tiny-toast').default;

export type Toast = {
  type: 'show';
  flavor?: 'success' | 'failure';
  message: string;
  duration: number;
};

export type GravityToast = {
  type: 'showWithGravity';
  flavor?: 'success' | 'failure';
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
    sink.addListener({
      next: (t) => {
        if (Platform.OS === 'android') {
          const flavorPrefix =
            t.flavor === 'success'
              ? '\u2713 '
              : t.flavor === 'failure'
              ? '\u2717 '
              : '';
          const args = [
            flavorPrefix + t.message,
            t.duration,
            (t as GravityToast).gravity,
          ].filter((x) => typeof x !== 'undefined');
          (ToastAndroid[t.type] as any)(...args);
        } else {
          if (t.flavor === 'success') {
            ToastIOS.showSuccess(t.message, {
              duration: t.duration,
              position: 0,
            });
          } else {
            const flavorPrefix = t.flavor === 'failure' ? '\u2717 ' : '';
            ToastIOS.show(flavorPrefix + t.message, {
              duration: t.duration,
              position: 0,
            });
          }
        }
      },
    });
  };
}
