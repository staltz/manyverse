/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import Stream from 'xstream';
import {Msg} from 'ssb-typescript';
const nest = require('depnest');

const publishHookOpinion = {
  gives: nest({
    'sbot.hook': ['publish', 'publishStream'],
  }),
  create: (api: any) => {
    const stream: Stream<Msg> = xs.create<any>();
    return nest({
      'sbot.hook': {
        publish: (msg: Msg) => {
          stream.shamefullySendNext(msg);
        },
        publishStream: () => stream,
      },
    });
  },
};

export default publishHookOpinion;
