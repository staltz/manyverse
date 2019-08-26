/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import os = require('os');
import path = require('path');
const rnBridge = require('rn-bridge');

process.env = process.env ?? {};
process.env.MANYVERSE_PLATFORM = 'mobile';
// process.env.DEBUG = '*'; // uncomment this to debug! don't commit it tho
// process.env.CHLORIDE_JS = 'yes'; // uncomment to enable WASM libsodium

// Set default directories
const appDataDir = (process.env.APP_DATA_DIR = rnBridge.app.datadir());
process.env.SSB_DIR = path.resolve(appDataDir, '.ssb');
const nodejsProjectDir = path.resolve(appDataDir, 'nodejs-project');
os.homedir = () => nodejsProjectDir;
process.cwd = () => nodejsProjectDir;

// Report JS backend crashes to Java, and in turn, to ACRA
process.on('unhandledRejection', (reason, _promise) => {
  rnBridge.channel.post('exception', reason);
  console.error(reason);
  setTimeout(() => {
    process.exit(1);
  });
});
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
