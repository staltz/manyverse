// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import os = require('os');
import fs = require('fs');
import path = require('path');
// import * as PH from 'perf_hooks';
const rnBridge = require('rn-bridge');

process.env ??= {};

// Set default directories
const appDataDir = (process.env.APP_DATA_DIR = rnBridge.app.datadir());
process.env.SSB_DIR = path.resolve(appDataDir, '.ssb');
const nodejsProjectDir = path.resolve(appDataDir, 'nodejs-project');
os.homedir = () => nodejsProjectDir;
process.cwd = () => nodejsProjectDir;

// Set global variables
process.env.MANYVERSE_PLATFORM = 'mobile';
// process.env.CHLORIDE_JS = 'yes'; // uncomment to enable WASM libsodium
if (fs.existsSync(path.join(process.env.SSB_DIR, 'DETAILED_LOGS'))) {
  process.env.DEBUG = '*';
}

// Report JS backend crashes to Java, and in turn, to ACRA
process.on('unhandledRejection', (reason) => {
  console.error(reason);
  rnBridge.channel.post('exception', reason);
  setTimeout(() => {
    process.exit(1);
  });
});
process.on('uncaughtExceptionMonitor' as any, (err: Error | string) => {
  console.error(err);
  if (typeof err === 'string') {
    rnBridge.channel.post('exception', err);
  } else {
    rnBridge.channel.post('exception', err.message + '\n' + err.stack);
  }
});

require('./index');
