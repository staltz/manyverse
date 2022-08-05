// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createElement as $} from 'react';
import {View} from 'react-native';
import {Blurhash} from 'react-native-blurhash';

export default function BlurhashAvatar({
  blurhash,
  size,
}: {
  blurhash: string;
  size: number;
}) {
  const width = size;
  const height = size;
  const borderRadius = size * 0.5;
  return $(View, {style: {width, height, borderRadius, overflow: 'hidden'}}, [
    $(Blurhash, {blurhash, style: {width, height}}),
  ]);
}
