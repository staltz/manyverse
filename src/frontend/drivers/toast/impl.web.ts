// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Toast} from './types';
import ToastWeb from './ToastWeb';

function toastDriver(sink: Stream<Toast>): void {
  sink.addListener({
    next: (t) => {
      ToastWeb.show(t);
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
