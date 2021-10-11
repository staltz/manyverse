// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId} from 'ssb-typescript';
import {Callback} from './helpers/types';
const pull = require('pull-stream');
const pullAsync = require('pull-async');
const cat = require('pull-cat');

type Output = {
  name?: string;
  image?: string;
  description?: string;
};

export = {
  name: 'aboutSelf',
  version: '1.0.0',
  manifest: {
    get: 'async',
    stream: 'source',
  },
  permissions: {
    master: {
      allow: ['get', 'stream'],
    },
  },
  init: function init(ssb: any) {
    function get(feedId: FeedId, cb: Callback<Output>) {
      // TODO: this is a workaround for https://github.com/ssb-ngi-pointer/ssb-db2/issues/235
      // When that issue is resolved, we should remove this boolean
      let done = false;
      ssb.db.onDrain('aboutSelf', () => {
        if (!done) {
          done = true;
          cb(null, ssb.db.getIndex('aboutSelf').getProfile(feedId));
        }
      });
    }

    function stream(feedId: FeedId) {
      return cat([
        // First deliver latest field value
        pull(
          pullAsync((cb: Callback<Output>) => {
            get(feedId, cb);
          }),
          pull.filter(
            (out: Output) => out.name || out.image || out.description,
          ),
        ),

        // Then deliver live field values
        ssb.db.getIndex('aboutSelf').getLiveProfile(feedId),
      ]);
    }

    return {
      get,
      stream,
    };
  },
};
