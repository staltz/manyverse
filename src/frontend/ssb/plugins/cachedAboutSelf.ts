/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Callback} from 'pull-stream';
import QuickLRU = require('quick-lru');
import {FeedId} from 'ssb-typescript';

interface Output {
  name?: string;
  image?: string;
  description?: string;
}

const cachedAboutSelf = {
  name: 'cachedAboutSelf' as const,

  version: '1.0.0',

  manifest: {
    invalidate: 'sync',
    getNameAndImage: 'async',
  },

  permissions: {
    master: {
      allow: ['invalidate', 'get'],
    },
  },

  init: (ssb: any) => {
    const DUNBAR = 150;
    const cache = new QuickLRU<FeedId, Output>({maxSize: DUNBAR});

    function isValid(out: Output | undefined) {
      if (!out) return false;
      if (!out.name && !out.image) return false;
      return true;
    }

    return {
      invalidate(id: FeedId) {
        cache.delete(id);
      },

      get(id: FeedId, cb: Callback<Output>) {
        if (cache.has(id)) {
          cb(null, cache.get(id));
        } else {
          ssb.aboutSelf.get(id, (err: any, out: Output) => {
            if (!err && isValid(out)) cache.set(id, out);
            cb(err, out);
          });
        }
      },
    };
  },
};

export default () => cachedAboutSelf;
