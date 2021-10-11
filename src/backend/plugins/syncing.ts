// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
