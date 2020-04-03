/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform} from 'react-native';

const BASE_SIZE = 16; // px | pt
const SCALE = 1.125;
const LEADING = 1.5;

const scaleUp = SCALE;
const scaleDown = 1 / SCALE;

export const Typography = {
  scaleUp,
  scaleDown,
  baseSize: BASE_SIZE,
  baseLeading: LEADING,
  fontSizeLarge: BASE_SIZE * scaleUp * scaleUp,
  fontSizeBig: BASE_SIZE * scaleUp,
  fontSizeNormal: BASE_SIZE,
  fontSizeSmall: BASE_SIZE * scaleDown,
  fontFamilyReadableText: Platform.select({
    android: 'sans-serif-light',
    ios: 'Helvetica Neue',
    default: 'sans-serif',
  }),
  fontFamilyMonospace: Platform.select({
    ios: 'Courier New',
    default: 'monospace',
  }),
};
