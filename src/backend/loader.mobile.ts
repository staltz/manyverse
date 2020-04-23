/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import os = require('os');
import fs = require('fs');
import path = require('path');
const rnBridge = require('rn-bridge');

process.env = process.env ?? {};

// Set default directories
const appDataDir = (process.env.APP_DATA_DIR = rnBridge.app.datadir());
process.env.SSB_DIR = path.resolve(appDataDir, '.ssb');
const nodejsProjectDir = path.resolve(appDataDir, 'nodejs-project');
os.homedir = () => nodejsProjectDir;
process.cwd = () => nodejsProjectDir;

// Set global variables
process.env.MANYVERSE_PLATFORM = 'mobile';
// process.env.PROFILER_NODEJS = 'yes'; // uncomment to enable the profiler
// process.env.CHLORIDE_JS = 'yes'; // uncomment to enable WASM libsodium
if (fs.existsSync(path.join(process.env.SSB_DIR, 'DETAILED_LOGS'))) {
  process.env.DEBUG = '*';
}

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

// Profile Node.js CPU usage, output to the tmp dir
// TODO unfortunately this is still unsupported in nodejs-mobile
if (process.env.PROFILER_NODEJS) {
  const inspector = require('inspector');
  const session = new inspector.Session();
  session.connect();
  session.post('Profiler.enable', () => {
    session.post('Profiler.start', () => {
      require('./index');
      setTimeout(() => {
        session.post('Profiler.stop', (err: any, res: any) => {
          if (err) return console.error(err);
          const data = res.profile || res.result;
          const date = new Date();
          const file = `${nodejsProjectDir}/flamechart_${date.getTime()}.json`;
          fs.writeFile(file, JSON.stringify(data), err2 => {
            if (err2) console.error(err2);
          });
        });
      }, 20e3);
    });
  });
} else {
  // Just run the backend without profiling
  require('./index');
}
