/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {descending, toPullStream} = require('ssb-db2/operators');

export = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    rawLogReversed: 'source',
  },
  permissions: {
    master: {
      allow: ['rawLogReversed'],
    },
  },
  init: function init(ssb: any) {
    return {
      rawLogReversed() {
        return ssb.db.query(descending(), toPullStream());
      },
    };
  },
};
