/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs = require('fs');
const path = require('path');
const ssbKeys = require('ssb-keys');
const mkdirp = require('mkdirp');
const makeConfig = require('ssb-config/inject');
import bluetoothTransport = require('./plugins/bluetooth');
import settingsUtils = require('./plugins/settingsUtils');
const SecretStack = require('secret-stack');

if (!process.env.APP_DATA_DIR || !process.env.SSB_DIR) {
  throw new Error('misconfigured default paths for the backend');
}

if (!fs.existsSync(process.env.SSB_DIR)) mkdirp.sync(process.env.SSB_DIR);
const keysPath = path.join(process.env.SSB_DIR, '/secret');
const keys = ssbKeys.loadOrCreateSync(keysPath);

const config = makeConfig('ssb', {
  path: process.env.SSB_DIR,
  keys,
  blobs: {
    sympathy: 2,
  },
  blobsPurge: {
    cpuMax: 30,
  },
  conn: {
    autostart: false,
  },
  friends: {
    hops: settingsUtils.readSync().hops ?? 2,
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

SecretStack({appKey: require('ssb-caps').shs})
  // Core
  .use(require('ssb-master'))
  .use(require('ssb-db'))
  // Replication
  .use(require('ssb-replicate')) // needs: db
  .use(require('ssb-friends')) // needs: db, replicate
  // FIXME: see issue https://github.com/ssbc/ssb-ebt/issues/33
  .use(require('ssb-ebt-fork-staltz')) // needs: db, replicate, friends
  // Connections
  .use(require('./plugins/multiserver-addons'))
  .use(require('ssb-lan'))
  .use(bluetoothTransport(keys, process.env.APP_DATA_DIR))
  .use(require('ssb-conn')) // needs: db, friends, lan, bluetooth
  .use(require('ssb-room/tunnel/client')) // needs: conn
  .use(require('ssb-dht-invite')) // needs: db, conn
  .use(require('ssb-invite-client')) // needs: db, conn
  // Queries
  .use(require('ssb-query')) // needs: db
  .use(require('ssb-private')) // needs: db
  .use(require('ssb-backlinks')) // needs: db
  .use(require('ssb-about')) // needs: db, backlinks
  .use(require('ssb-suggest')) // needs: db, backlinks, about, friends
  .use(require('ssb-threads')) // needs: db, backlinks, friends
  // Blobs
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  .use(require('ssb-blobs-purge')) // needs: blobs, backlinks
  // Customizations
  .use(require('./plugins/blobsUtils')) // needs: blobs
  .use(require('./plugins/connUtilsBack')) // needs: conn
  .use(require('./plugins/publishUtilsBack')) // needs: db, blobs, blobsUtils
  .use(require('./plugins/friendsUtils')) // needs: db
  .use(require('./plugins/keysUtils'))
  .use(settingsUtils) // needs: blobs-purge
  .use(require('./plugins/syncing')) // needs: db
  .use(require('./plugins/votes')) // needs: backlinks
  .call(null, config);
