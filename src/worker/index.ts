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

import {self} from '@staltz/react-native-workers/self';
import {ssbKeysPath, ssbPath} from '../ssb/defaults';
import {Readable, Callback} from '../typings/pull-stream';
const ssbKeys = require('react-native-ssb-client-keys');
const pull = require('pull-stream');
const muxrpc = require('muxrpc');
const Config = require('ssb-config/inject');
const MultiServer = require('multiserver');
const workerPlugin = require('multiserver-worker');
const createClient = require('ssb-client');

const manifest = {
  auth: 'async',
  address: 'async',
  manifest: 'async',
  get: 'async',
  createFeedStream: 'source',
  createLogStream: 'source',
  messagesByType: 'source',
  createHistoryStream: 'source',
  createUserStream: 'source',
  links: 'source',
  relatedMessages: 'async',
  add: 'async',
  publish: 'async',
  getAddress: 'async',
  getLatest: 'async',
  latest: 'source',
  latestSequence: 'async',
  whoami: 'async',
  usage: 'async',
  plugins: {
    install: 'source',
    uninstall: 'source',
    enable: 'async',
    disable: 'async',
  },
  gossip: {
    peers: 'async',
    add: 'async',
    remove: 'async',
    ping: 'duplex',
    connect: 'async',
    changes: 'source',
    reconnect: 'async',
  },
  friends: {
    get: 'async',
    createFriendStream: 'source',
    hops: 'async',
    stream: 'source',
  },
  replicate: {
    changes: 'source',
    upto: 'source',
  },
  blobs: {
    get: 'source',
    getSlice: 'source',
    add: 'sink',
    rm: 'async',
    ls: 'source',
    has: 'async',
    size: 'async',
    meta: 'async',
    want: 'async',
    push: 'async',
    changes: 'source',
    createWants: 'source',
  },
  backlinks: {
    read: 'source',
  },
  about: {
    stream: 'source',
    get: 'async',
  },
  contacts: {
    stream: 'source',
    get: 'async',
  },
  query: {
    read: 'source',
  },
  invite: {
    create: 'async',
    accept: 'async',
    use: 'async',
  },
  block: {
    isBlocked: 'async',
  },
  private: {
    publish: 'async',
    unbox: 'async',
    read: 'source',
  },
};

const ms = MultiServer([workerPlugin({worker: self})]);

const keysPromise = new Promise((resolve, reject) => {
  ssbKeys.loadOrCreate(ssbKeysPath, (err: any, keys: any) => {
    if (err) {
      reject(err);
    } else if (keys) {
      resolve(keys);
    }
  });
});

function sleep(period: number): Promise<any> {
  return new Promise(resolve => {
    setTimeout(resolve, period);
  });
}

const ssbClientPromise = keysPromise.then(async function setupSSBClient(keys) {
  const config = Config('ssb');
  config.path = ssbPath;
  let ssbClient = null;
  do {
    try {
      ssbClient = await new Promise<any>((resolve, reject) => {
        createClient(keys, config, (err: any, sbot: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(sbot);
          }
        });
      });
    } catch (err) {
      await sleep(200);
    }
  } while (ssbClient === null);
  return ssbClient;
});

ms.server((stream: Readable<any>) => {
  ssbClientPromise.then(ssbClient => {
    const codec = (x: any) => x;
    const server = muxrpc(null, manifest, codec)(ssbClient);
    pull(stream, server.createStream(), stream);
  });
});
