/* Copyright (C) 2018-2019 The Manyverse Authors.
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
const NoauthTransformPlugin = require('multiserver/plugins/noauth');
const WS = require('multiserver/plugins/ws');
const npip = require('non-private-ip');
const injectSsbConfig = require('ssb-config/inject');
const BluetoothManager = require('ssb-mobile-bluetooth-manager');
const bluetoothTransportAndPlugin = require('ssb-bluetooth');
import syncingPlugin = require('./plugins/syncing');
import blobsFromPathPlugin = require('./plugins/blobsFromPath');
import votesPlugin = require('./plugins/votes');
import manifest = require('./manifest');

const appDataDir = rnBridge.app.datadir();
const ssbPath = path.resolve(appDataDir, '.ssb');
if (!fs.existsSync(ssbPath)) {
  mkdirp.sync(ssbPath);
}
const keysPath = path.join(ssbPath, '/secret');
const keys = ssbKeys.loadOrCreateSync(keysPath);

const config = (() => {
  const c = injectSsbConfig();
  const NET_PORT = 26831;
  const DHT_PORT = 26832;
  const host = npip.private(); // Avoid (public) rmnet IP addresses
  c.path = ssbPath;
  c.keys = keys;
  c.manifest = manifest;
  c.friends.hops = 2;
  c.connections = {
    incoming: {
      net: [{scope: 'private', transform: 'shs', host, port: NET_PORT}],
      dht: [{scope: 'public', transform: 'shs', port: DHT_PORT}],
      channel: [{scope: 'device', transform: 'noauth'}],
      bluetooth: [{scope: 'public', transform: 'shs'}],
    },
    outgoing: {
      net: [{transform: 'shs'}],
      dht: [{transform: 'shs'}],
      ws: [{transform: 'shs'}],
      bluetooth: [{scope: 'public', transform: 'shs'}],
    },
  };
  return c;
})();

function noAuthTransform(_sbot: any, cfg: any) {
  _sbot.multiserver.transform({
    name: 'noauth',
    create: () =>
      NoauthTransformPlugin({
        keys: {
          publicKey: Buffer.from(cfg.keys.public, 'base64'),
        },
      }),
  });
}

function rnChannelTransport(_sbot: any) {
  _sbot.multiserver.transport({
    name: 'channel',
    create: () => rnChannelPlugin(rnBridge.channel),
  });
}

function wsTransport(_sbot: any) {
  _sbot.multiserver.transport({
    name: 'ws',
    create: () => WS({}),
  });
}

function dhtTransport(_sbot: any) {
  _sbot.multiserver.transport({
    name: 'dht',
    create: (dhtConfig: any) =>
      DHT({keys: _sbot.dhtInvite.channels(), port: dhtConfig.port}),
  });
}

const bluetoothManager: any = BluetoothManager({
  socketFolderPath: appDataDir,
  myIdent: '@' + keys.public,
  metadataServiceUUID: 'b4721184-46dc-4314-b031-bf52c2b197f3',
  controlSocketFilename: 'manyverse_bt_control.sock',
  incomingSocketFilename: 'manyverse_bt_incoming.sock',
  outgoingSocketFilename: 'manyverse_bt_outgoing.sock',
  logStreams: false,
});

const bluetoothPluginConfig = {
  scope: 'public',
};

require('ssb-server/index')
  .use(noAuthTransform)
  .use(rnChannelTransport)
  .use(wsTransport)
  .use(require('ssb-dht-invite'))
  .use(dhtTransport)
  .use(bluetoothTransportAndPlugin(bluetoothManager, bluetoothPluginConfig))
  .use(require('ssb-server/plugins/master'))
  .use(require('ssb-lan'))
  .use(require('ssb-conn'))
  .use(require('ssb-server/plugins/replicate'))
  .use(syncingPlugin)
  .use(require('ssb-backlinks'))
  .use(require('ssb-about'))
  .use(require('ssb-friends'))
  .use(require('ssb-blobs'))
  .use(blobsFromPathPlugin)
  .use(votesPlugin)
  .use(require('ssb-serve-blobs'))
  .use(require('ssb-private'))
  .use(require('ssb-contacts'))
  .use(require('ssb-query'))
  .use(require('ssb-threads'))
  .use(require('ssb-server/plugins/invite'))
  .use(require('ssb-ebt'))
  .call(null, config);
