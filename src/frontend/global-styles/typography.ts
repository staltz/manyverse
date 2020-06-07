/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform} from 'react-native';

type Scale = 'tiny' | 'small' | 'normal' | 'big' | 'large' | 'larger';

const FONT_SIZE = 16;
const FONT_SCALE = 1.125;
const LINE_SCALE = 1.5;
const SIZES = {tiny: -2, small: -1, normal: 0, big: 1, large: 2, larger: 3};

export const fontSize = (scale: Scale) =>
  FONT_SIZE * Math.pow(FONT_SCALE, SIZES[scale]);

export const lineHeight = (scale: Scale) =>
  FONT_SIZE * Math.pow(FONT_SCALE, SIZES[scale]) * LINE_SCALE;

export const fontSizeLineHeight = (scale: Scale) => ({
  fontSize: fontSize(scale),
  lineHeight: lineHeight(scale),
});

export const Typography = {
  fontSizeLarger: fontSize('larger'),
  lineHeightLarger: lineHeight('larger'),

  fontSizeLarge: fontSize('large'),
  lineHeightLarge: lineHeight('large'),

  fontSizeBig: fontSize('big'),
  lineHeightBig: lineHeight('big'),

  fontSizeNormal: fontSize('normal'),
  lineHeightNormal: lineHeight('normal'),

  fontSizeSmall: fontSize('small'),
  lineHeightSmall: lineHeight('small'),

  fontSizeTiny: fontSize('tiny'),
  lineHeightTiny: lineHeight('tiny'),

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
