/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import HeaderButton from './HeaderButton';

export default function HeaderBackButton(sel: string) {
  return h(HeaderButton, {
    sel,
    icon: 'arrow-left',
    accessibilityLabel: 'Back Button',
  });
}
