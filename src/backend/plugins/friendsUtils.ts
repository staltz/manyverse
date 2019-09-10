/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId, Msg} from 'ssb-typescript';
const pull = require('pull-stream');
const cat = require('pull-cat');

export = {
  name: 'friendsUtils',
  version: '1.0.0',
  manifest: {
    isPrivatelyBlockingStream: 'source',
  },
  permissions: {
    master: {
      allow: ['isPrivatelyBlockingStream'],
    },
  },
  init: function init(ssb: any) {
    return {
      isPrivatelyBlockingStream(dest: FeedId) {
        return pull(
          cat([
            pull(
              ssb.links({
                source: ssb.id,
                dest,
                rel: 'contact',
                live: false,
                reverse: true,
              }),
              pull.take(1),
            ),
            ssb.links({
              source: ssb.id,
              dest,
              rel: 'contact',
              old: false,
              live: true,
            }),
          ]),
          pull.asyncMap((link: any, cb: any) => {
            ssb.get(link.key, cb);
          }),
          pull.map((val: Msg['value']) => typeof val.content === 'string'),
        );
      },
    };
  },
};
