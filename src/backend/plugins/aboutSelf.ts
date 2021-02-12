/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
      ssb.db.onDrain('aboutSelf', () => {
        cb(null, ssb.db.getIndex('aboutSelf').getProfile(feedId));
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
