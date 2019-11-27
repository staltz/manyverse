/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs = require('fs');
const path = require('path');
const ssbKeys = require('ssb-keys');
const mkdirp = require('mkdirp');
const rnBridge = require('rn-bridge');
const makeConfig = require('ssb-config/inject');
const BluetoothManager = require('ssb-mobile-bluetooth-manager');
const bluetoothTransportAndPlugin = require('ssb-bluetooth');
const SecretStack = require('secret-stack');

const appDataDir = rnBridge.app.datadir();
const ssbPath = path.resolve(appDataDir, '.ssb');
if (!fs.existsSync(ssbPath)) mkdirp.sync(ssbPath);
const keys = ssbKeys.loadOrCreateSync(path.join(ssbPath, 'secret'));

const config = makeConfig('ssb', {
  path: ssbPath,
  keys,
  conn: {
    autostart: false,
  },
  friends: {
    hops: 2,
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

const bluetoothManager: any = BluetoothManager({
  socketFolderPath: appDataDir,
  myIdent: '@' + keys.public,
  metadataServiceUUID: 'b4721184-46dc-4314-b031-bf52c2b197f3',
  controlSocketFilename: 'manyverse_bt_control.sock',
  incomingSocketFilename: 'manyverse_bt_incoming.sock',
  outgoingSocketFilename: 'manyverse_bt_outgoing.sock',
  logStreams: false,
});

SecretStack({appKey: require('ssb-caps').shs})
  // Core
  .use(require('ssb-master'))
  .use(require('ssb-db'))
  // Replication
  .use(require('ssb-replicate')) // needs: db
  .use(require('ssb-friends')) // needs: db, replicate
  .use(require('ssb-ebt')) // needs: db, replicate, friends
  // Connections
  .use(require('./multiserver'))
  .use(require('ssb-lan'))
  .use(bluetoothTransportAndPlugin(bluetoothManager, {scope: 'public'}))
  .use(require('ssb-conn')) // needs: db, friends, lan, bluetooth
  .use(require('ssb-room/tunnel/client')) // needs: conn
  .use(require('ssb-dht-invite')) // needs: db, conn
  .use(require('ssb-invite-client')) // needs: db, conn
  // Queries
  .use(require('ssb-query')) // needs: db
  .use(require('ssb-private')) // needs: db
  .use(require('ssb-backlinks')) // needs: db
  .use(require('ssb-about')) // needs: db, backlinks
  .use(require('ssb-suggest-fork')) // needs: db, backlinks, about, friends
  .use(require('ssb-threads')) // needs: db, backlinks, friends
  // Blobs
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  // Customizations
  .use(require('./plugins/blobsUtils')) // needs: blobs
  .use(require('./plugins/connUtils')) // needs: conn
  .use(require('./plugins/feedUtilsBack')) // needs: db, blobs, blobsUtils
  .use(require('./plugins/friendsUtils')) // needs: db
  .use(require('./plugins/keysUtils'))
  .use(require('./plugins/syncing')) // needs: db
  .use(require('./plugins/votes')) // needs: backlinks
  .call(null, config);
