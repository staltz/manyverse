/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const caps = require('ssb-caps');
const ssbKeys = require('ssb-keys');
const makeConfig = require('ssb-config/inject');
const SecretStack = require('secret-stack');
import settingsUtils = require('./plugins/settingsUtils');
import bluetoothTransport = require('./plugins/bluetooth');

if (!process.env.APP_DATA_DIR || !process.env.SSB_DIR) {
  throw new Error('misconfigured default paths for the backend');
}

if (!fs.existsSync(process.env.SSB_DIR)) mkdirp.sync(process.env.SSB_DIR);

// One-time fixes for special issues
const ISSUE_1223 = path.join(process.env.SSB_DIR, 'issue1223');
if (!fs.existsSync(ISSUE_1223)) {
  rimraf.sync(path.join(process.env.SSB_DIR, 'db2'));
  fs.closeSync(fs.openSync(ISSUE_1223, 'w'));
}
const ISSUE_1328 = path.join(process.env.SSB_DIR, 'issue1328');
if (!fs.existsSync(ISSUE_1328)) {
  rimraf.sync(path.join(process.env.SSB_DIR, 'db2', 'indexes') + '/*.*');
  fs.closeSync(fs.openSync(ISSUE_1328, 'w'));
}

const keysPath = path.join(process.env.SSB_DIR, 'secret');
const keys = ssbKeys.loadOrCreateSync(keysPath);

const config = makeConfig('ssb', {
  path: process.env.SSB_DIR,
  keys,
  db2: {
    maxCpu: 91, // %
    maxCpuWait: 80, // ms
    maxCpuMaxPause: 120, // ms
    automigrate: true,
    dangerouslyKillFlumeWhenMigrated:
      process.env.MANYVERSE_PLATFORM === 'mobile',
  },
  blobs: {
    sympathy: 2,
  },
  blobsPurge: {
    cpuMax: 90,
  },
  conn: {
    autostart: false,
  },
  friends: {
    hops: settingsUtils.readSync().hops ?? 2,
  },
  suggest: {
    autostart: false,
  },
  connections: {
    incoming: {
      net: [{scope: 'private', transform: 'shs', port: 26831}],
      dht: [{scope: 'public', transform: 'shs', port: 26832}],
      channel: [{scope: 'device', transform: 'noauth'}],
      bluetooth: [{scope: 'public', transform: 'shs'}],
      tunnel: [{scope: 'public', transform: 'shs'}],
    },
    outgoing: {
      net: [{transform: 'shs'}],
      dht: [{transform: 'shs'}],
      ws: [{transform: 'shs'}],
      bluetooth: [{scope: 'public', transform: 'shs'}],
      tunnel: [{transform: 'shs'}],
    },
  },
});

SecretStack({caps})
  // Core
  .use(require('ssb-master'))
  .use(require('ssb-db2'))
  .use(require('ssb-db2/compat/db'))
  .use(require('ssb-db2/compat/ebt'))
  .use(require('ssb-db2/compat/log-stream'))
  .use(require('ssb-db2/compat/history-stream'))
  .use(require('ssb-deweird/producer'))
  // Replication
  .use(require('ssb-replicate')) // needs: db2/compat/log- & history-stream
  .use(require('ssb-friends')) // needs: db, replicate
  .use(require('ssb-ebt-fork-staltz')) // needs: db2/compat, replicate, friends
  // Connections
  .use(require('./plugins/multiserver-addons'))
  .use(require('ssb-lan'))
  .use(bluetoothTransport(keys, process.env.APP_DATA_DIR))
  .use(require('ssb-conn')) // needs: db, friends, lan, bluetooth
  .use(require('ssb-room-client')) // needs: conn
  .use(require('ssb-http-auth-client')) // needs: conn
  .use(require('ssb-http-invite-client'))
  .use(require('ssb-dht-invite')) // needs: db, friends, conn
  .use(require('ssb-invite-client')) // needs: db, conn
  // Queries
  .use(require('ssb-db2/about-self')) // needs: db2
  .use(require('ssb-suggest-lite')) // needs: db2, about-self, friends
  .use(require('ssb-threads')) // needs: db, db2, friends
  .use(require('ssb-db2/full-mentions')) // needs: db2
  // Blobs
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  .use(require('ssb-blobs-purge')) // needs: blobs, db2/full-mentions
  // Customizations
  .use(require('./plugins/blobsUtils')) // needs: blobs
  .use(require('./plugins/connUtilsBack')) // needs: conn
  .use(require('./plugins/aboutSelf')) // needs: db2
  .use(require('./plugins/publishUtilsBack')) // needs: db, blobs, blobsUtils
  .use(require('./plugins/friendsUtils')) // needs: db2
  .use(require('./plugins/keysUtils'))
  .use(settingsUtils) // needs: blobs-purge
  .use(require('./plugins/syncing')) // needs: db2
  .use(require('./plugins/dbUtils')) // needs: db2, syncing
  .use(require('./plugins/votes')) // needs: db2
  .call(null, config);
