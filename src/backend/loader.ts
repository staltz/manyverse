/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import os = require('os');
const path = require('path');
const rnBridge = require('rn-bridge');

// Set default directory
const nodejsProjectDir = path.resolve(rnBridge.app.datadir(), 'nodejs-project');
os.homedir = () => nodejsProjectDir;
process.cwd = () => nodejsProjectDir;

// Force libsodium to use a WebAssembly implementation
process.env = process.env || {};
process.env.CHLORIDE_JS = 'yes';

// Report JS backend crashes to Java, and in turn, to ACRA
process.on('uncaughtException', err => {
  if (typeof err === 'string') {
    rnBridge.channel.post('exception', err);
  } else {
    rnBridge.channel.post('exception', err.message + '\n' + err.stack);
  }
  console.error(err);
  setTimeout(() => {
    process.exit(1);
  });
});
const _removeAllListeners = process.removeAllListeners;
process.removeAllListeners = function removeAllListeners(eventName: string) {
  if (eventName !== 'uncaughtException') {
    return _removeAllListeners.call(this, eventName);
  }
  return process;
};

require('./index');
