// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {GravityToast, Toast} from './types';
const ToastIOS = require('react-native-tiny-toast').default;

function toastDriver(sink: Stream<Toast | GravityToast>): void {
  sink.addListener({
    next: (t) => {
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
    },
  });
}

toastDriver.Duration = {
  SHORT: 3000,
  LONG: 6000,
};

toastDriver.Gravity = {
  TOP: 'top',
  CENTER: 'center',
  BOTTOM: 'bottom',
};

export default toastDriver;
