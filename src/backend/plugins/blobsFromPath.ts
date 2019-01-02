/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pull = require('pull-stream');
const Read = require('pull-file');

function init(sbot: any) {
  if (!sbot.blobs || !sbot.blobs.add) {
    throw new Error('"blobsFromPath" is missing required plugin "ssb-blobs"');
  }

  return {
    add: function add(path: string, cb: (_e: any, _h?: string) => void) {
      pull(Read(path, {}), sbot.blobs.add(cb));
    },
  };
}

export = {
  name: 'blobsFromPath',
  version: '1.0.0',
  manifest: {
    add: 'async',
  },
  permissions: {
    master: {
      allow: ['add'],
    },
  },
  init,
};
