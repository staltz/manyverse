// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Toast} from './types';

export default class ToastWeb {
  static show(t: Toast) {
    throw new Error('ToastWeb not implemented on mobile');
  }

  static DURATION_LONG = 6000;
  static DURATION_SHORT = 3000;
}
