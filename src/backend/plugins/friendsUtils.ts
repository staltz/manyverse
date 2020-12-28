/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId, Msg} from 'ssb-typescript';
const pull = require('pull-stream');
const cat = require('pull-cat');
const {
  and,
  author,
  contact,
  descending,
  live,
  toPullStream,
} = require('ssb-db2/operators');

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
              ssb.db.query(
                and(author(ssb.id), contact(dest)),
                descending(),
                toPullStream(),
              ),
              pull.take(1),
            ),
            ssb.db.query(
              and(author(ssb.id), contact(dest)),
              live(),
              toPullStream(),
            ),
          ]),
          pull.map((msg: Msg) => {
            if (!msg || !msg.value) return false;
            if (typeof msg.value.content === 'string') return true;
            if ((msg.value as any).meta?.private === true) return true;
            return false;
          }),
        );
      },
    };
  },
};
