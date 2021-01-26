/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fromEvent = require('pull-stream-util/from-event');

export = {
  name: 'syncing',
  version: '1.0.0',
  manifest: {
    migrating: 'source',
    indexing: 'source',
  },
  permissions: {
    master: {
      allow: ['migrating', 'indexing'],
    },
  },
  init: function init(ssb: any) {
    return {
      migrating() {
        return fromEvent('ssb:db2:migrate:progress', ssb);
      },

      indexing() {
        return fromEvent('ssb:db2:indexing:progress', ssb);
      },
    };
  },
};
