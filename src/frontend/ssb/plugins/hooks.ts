// SPDX-FileCopyrightText: 2018-2019 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {Msg} from 'ssb-typescript';

const hooksPlugin = {
  name: 'hooks' as const,
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
