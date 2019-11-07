/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Setup initial communication with the frontend, to create or restore identity
if (process.env.MANYVERSE_PLATFORM === 'mobile') {
  const rnBridge = require('rn-bridge');
  const restore = require('./restore');
  rnBridge.channel.on('identity', (request: string) => {
    const startSSB = () => require('./ssb');
    let response;
    if (request === 'CREATE' || request === 'USE') {
      startSSB();
      response = 'IDENTITY_READY';
    } else if (request.startsWith('RESTORE:')) {
      const words = request.split('RESTORE: ')[1].trim();
      response = restore(words);
      if (response === 'IDENTITY_READY') startSSB();
    }
    rnBridge.channel.post('identity', response);
  });
} else {
  require('./ssb');
}
