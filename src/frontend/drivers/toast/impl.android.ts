// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ToastAndroid} from 'react-native';
import {GravityToast, Toast} from './types';

function toastDriver(sink: Stream<Toast | GravityToast>): void {
  sink.addListener({
    next: (t) => {
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
    },
  });
}

toastDriver.Duration = {
  SHORT: ToastAndroid.SHORT,
  LONG: ToastAndroid.LONG,
};

toastDriver.Gravity = {
  TOP: ToastAndroid.TOP,
  CENTER: ToastAndroid.CENTER,
  BOTTOM: ToastAndroid.BOTTOM,
};

export default toastDriver;
