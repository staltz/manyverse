/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs = require('fs');
const path = require('path');
const ssbKeys = require('ssb-keys');
const mkdirp = require('mkdirp');
const DHT = require('multiserver-dht');
const rnBridge = require('rn-bridge');
const rnChannelPlugin = require('multiserver-rn-channel');
import syncingPlugin = require('./plugins/syncing');
import blobsFromPathPlugin = require('./plugins/blobsFromPath');
import manifest = require('./manifest');

const appDataDir = rnBridge.app.datadir();
const ssbPath = path.resolve(appDataDir, '.ssb');
if (!fs.existsSync(ssbPath)) {
  mkdirp.sync(ssbPath);
}
const keysPath = path.join(ssbPath, '/secret');
const keys = ssbKeys.loadOrCreateSync(keysPath);

const config = require('ssb-config/inject')();
config.path = ssbPath;
config.keys = keys;
config.manifest = manifest;
config.friends.hops = 2;
config.connections = {
  incoming: {
    net: [{scope: 'private', transform: 'shs', port: 8008}],
    dht: [{scope: 'public', transform: 'shs', port: 8423}],
    channel: [{scope: 'device', transform: 'noauth'}],
  },
  outgoing: {
    net: [{transform: 'shs'}],
    dht: [{transform: 'shs'}],
  },
};

function rnChannelTransport(_sbot: any) {
  _sbot.multiserver.transport({
    name: 'channel',
    create: () => rnChannelPlugin(rnBridge.channel),
  });
}

function dhtTransport(_sbot: any) {
  _sbot.multiserver.transport({
    name: 'dht',
    create: (dhtConfig: any) =>
      DHT({keys: _sbot.dhtInvite.channels(), port: dhtConfig.port}),
  });
}

const sbot = require('scuttlebot/index')
  .use(rnChannelTransport)
  .use(require('ssb-dht-invite'))
  .use(dhtTransport)
  .use(require('scuttlebot/plugins/master'))
  .use(require('@staltz/sbot-gossip'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(syncingPlugin)
  .use(require('ssb-friends'))
  .use(require('ssb-blobs'))
  .use(blobsFromPathPlugin)
  .use(require('ssb-serve-blobs'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-private'))
  .use(require('ssb-about'))
  .use(require('ssb-contacts'))
  .use(require('ssb-query'))
  .use(require('ssb-threads'))
  .use(require('scuttlebot/plugins/invite'))
  .use(require('scuttlebot/plugins/local'))
  .use(require('ssb-ebt'))
  .call(null, config);

sbot.dhtInvite.start();
