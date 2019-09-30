/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mnemonic = require('ssb-keys-mnemonic');

export = {
  name: 'keysUtils',
  version: '1.0.0',
  manifest: {
    getMnemonic: 'sync',
  },
  permissions: {
    master: {
      allow: ['getMnemonic'],
    },
  },
  init: function init(ssb: any) {
    return {
      getMnemonic() {
        return mnemonic.keysToWords(ssb.keys);
      },
    };
  },
};
