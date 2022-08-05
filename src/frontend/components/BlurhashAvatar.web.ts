// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createElement as $} from 'react';
import {Blurhash} from 'react-blurhash';

export default function BlurhashAvatar({
  blurhash,
  size,
}: {
  blurhash: string;
  size: number;
}) {
  return $(Blurhash, {
    hash: blurhash,
    width: `${size}px`,
    height: `${size}px`,
    style: {
      borderRadius: `${size * 0.5}px`,
      overflow: 'hidden',
    },
  });
}
