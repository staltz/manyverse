// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

const pull = require('pull-stream');
const Read = require('pull-file');
import {Callback} from './helpers/types';

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
      addFromPath(path: string, cb: Callback<any>) {
        pull(Read(path, {}), ssb.blobs.add(cb));
      },
    };
  },
};
