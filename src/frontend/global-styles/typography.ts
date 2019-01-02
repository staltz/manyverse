/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const BASE_SIZE = 15; // px
const SCALE = 1.125;

const scaleUp = SCALE;
const scaleDown = 1 / SCALE;

export const Typography = {
  scaleUp,
  scaleDown,
  baseSize: BASE_SIZE,
  fontSizeLarge: BASE_SIZE * scaleUp * scaleUp,
  fontSizeBig: BASE_SIZE * scaleUp,
  fontSizeNormal: BASE_SIZE,
  fontSizeSmall: BASE_SIZE * scaleDown,
  fontFamilyReadableText: 'sans-serif-light',
  fontFamilyMonospace: 'monospace',
};
