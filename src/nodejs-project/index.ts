/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import fs = require('fs');
const path = require('path');
const ssbKeys = require('ssb-keys');
const mkdirp = require('mkdirp');
const DHT = require('multiserver-dht');
import syncingPlugin = require('./plugins/syncing');
import manifest = require('./manifest');
import exportSecret = require('./export-secret');
import importSecret = require('./import-secret');

// Hack until appDataDir plugin comes out
const appExclusivePath = path.join(__dirname, '..');
const ssbPath = path.resolve(appExclusivePath, '.ssb');
if (!fs.existsSync(ssbPath)) {
  mkdirp.sync(ssbPath);
}
const keysPath = path.join(ssbPath, '/secret');

/**
 * This helps us migrate secrets from one location to the other
 * because app codename will change from alpha to beta.
 */
type ReleaseType = 'last-alpha' | 'first-beta' | 'other';

const releaseType: ReleaseType = 'first-beta';

let keys: any;
if ((releaseType as any) === 'last-alpha') {
  keys = ssbKeys.loadOrCreateSync(keysPath);
  exportSecret(ssbPath, keys);
} else if (releaseType === 'first-beta') {
  keys = importSecret(ssbPath, keysPath) || ssbKeys.loadOrCreateSync(keysPath);
} else {
  keys = ssbKeys.loadOrCreateSync(keysPath);
}

const config = require('ssb-config/inject')();
config.path = ssbPath;
config.keys = keys;
config.manifest = manifest;
config.friends.hops = 2;
config.connections = {
  incoming: {
    net: [{scope: 'private', transform: 'shs', port: 8008}],
    dht: [{scope: 'public', transform: 'shs', port: 8423}],
    ws: [{scope: 'device', transform: 'noauth', port: 8422}],
  },
  outgoing: {
    net: [{transform: 'shs'}],
    dht: [{transform: 'shs'}],
    ws: [{transform: 'shs'}],
  },
};

function dhtTransport(_sbot: any) {
  _sbot.multiserver.transport({
    name: 'dht',
    create: (dhtConfig: any) =>
      DHT({keys: _sbot.dhtInvite.channels(), port: dhtConfig.port}),
  });
}

const sbot = require('scuttlebot/index')
  .use(require('ssb-dht-invite'))
  .use(dhtTransport)
  .use(require('scuttlebot/plugins/plugins'))
  .use(require('scuttlebot/plugins/master'))
  .use(require('@staltz/sbot-gossip'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(syncingPlugin)
  .use(require('ssb-friends'))
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-private'))
  .use(require('ssb-about'))
  .use(require('ssb-contacts'))
  .use(require('ssb-query'))
  .use(require('ssb-threads'))
  .use(require('scuttlebot/plugins/invite'))
  .use(require('scuttlebot/plugins/local'))
  .use(require('scuttlebot/plugins/logging'))
  .use(require('ssb-ebt'))
  .call(null, config);

sbot.dhtInvite.start();
