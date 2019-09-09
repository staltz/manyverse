/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {Msg} from 'ssb-typescript';

const hooksPlugin = {
  name: 'hooks',
  init: () => {
    const stream = xs.create<Msg>();
    return {
      publish: (msg: Msg) => {
        stream.shamefullySendNext(msg);
      },
      publishStream: () => stream,
    };
  },
};

export default () => hooksPlugin;
