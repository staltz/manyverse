// SPDX-FileCopyrightText: 2018-2019 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

const Mnemonic = require('ssb-keys-mnemonic');

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
  init: function init(ssb: any, _config: any) {
    return {
      getMnemonic() {
        return Mnemonic.keysToWords(ssb.keys);
      },
    };
  },
};
