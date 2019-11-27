/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pull = require('pull-stream');
const Read = require('pull-file');

type Callback = (e: any, x?: any) => void;

export = {
  name: 'blobsUtils',
  version: '1.0.0',
  manifest: {
    addFromPath: 'async',
  },
  permissions: {
    master: {
      allow: ['addFromPath'],
    },
  },
  init: function init(ssb: any) {
    if (!ssb.blobs?.add) {
      throw new Error('"blobsUtils" is missing required plugin "ssb-blobs"');
    }

    return {
      addFromPath(path: string, cb: Callback) {
        pull(Read(path, {}), ssb.blobs.add(cb));
      },
    };
  },
};
