/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

const fs = require('fs');
const path = require('path');
const ssbKeys = require('ssb-keys');
const mkdirp = require('mkdirp');
// const rn_bridge = require('rn-bridge');
// const makeRnChannelPlugin = require('multiserver-rn-channel');
const makeNoauthPlugin = require('multiserver/plugins/noauth');
const makeWSPlugin = require('multiserver/plugins/ws');
import manifest = require('./manifest');
// import {clearImmediate} from 'timers';

// Hack until appDataDir plugin comes out
const writablePath = path.join(__dirname, '..');
const ssbPath = path.resolve(writablePath, '.ssb');

if (!fs.existsSync(ssbPath)) {
  mkdirp.sync(ssbPath);
}
const keys = ssbKeys.loadOrCreateSync(path.join(ssbPath, '/secret'));

const config = require('ssb-config/inject')();
config.path = ssbPath;
config.keys = keys;
config.manifest = manifest;
config.friends.hops = 2;
config.connections = {
  incoming: {
    net: [{scope: 'public', transform: 'shs'}],
    // channel: [{scope: 'private', transform: 'noauth'}],
    ws: [{scope: 'private', transform: 'noauth'}],
  },
  outgoing: {
    net: [{transform: 'shs'}],
    // channel: [{scope: 'private', transform: 'noauth'}],
    ws: [{transform: 'noauth'}],
  },
};

// let subscription: any = null;
// const buffer: Array<any> = [];
// const wrappedChannel = {
//   send(msg: string) {
//     console.log('<>SERVER SENT ' + msg);
//     buffer.push(msg);
//     if (subscription) clearImmediate(subscription);
//     subscription = setImmediate(() => {
//       subscription = null;
//       if (buffer.length === 0) return;
//       rn_bridge.channel.send(buffer.join('$$$'));
//       while (buffer.length > 0) buffer.pop();
//     });
//   },
//   addListener(type: string, listener: any) {
//     rn_bridge.channel.addListener(type, (msg: string) => {
//       console.log('<>SERVER GOT ' + msg);
//       const msgs = msg.split('$$$');
//       msgs.forEach(listener);
//       // listener(msg);
//     });
//   },
// };

// function rnChannelTransport(stack: any) {
//   stack.multiserver.transport({
//     name: 'channel',
//     create: () => {
//       return makeRnChannelPlugin(wrappedChannel);
//     },
//   });
// }

function noauthTransform(stack: any, cfg: any) {
  stack.multiserver.transform({
    name: 'noauth',
    create: () => {
      return makeNoauthPlugin({
        keys: {
          publicKey: Buffer.from(cfg.keys.public, 'base64'),
        },
      });
    },
  });
}

function wsTransport(stack: any) {
  stack.multiserver.transport({
    name: 'ws',
    create: (cfg: any) => {
      // tslint:disable-next-line:no-bitwise
      // if (!cfg.port) cfg.port = 1024 + ~~(Math.random() * (65536 - 1024));
      return makeWSPlugin({host: 'localhost', port: '8422'});
    },
  });
}

console.error('WILL construct scuttlebot');
require('scuttlebot/index')
  // .use(rnChannelTransport)
  .use(noauthTransform)
  .use(wsTransport)
  .use(require('scuttlebot/plugins/plugins'))
  .use(require('scuttlebot/plugins/master'))
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/replicate'))
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
  .call(null, config);
