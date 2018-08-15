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
import {Readable} from '../typings/pull-stream';
import {manifest} from '../ssb/manifest-client';
import {startSyncingNotifications} from './syncing-notifications';
const ssbKeys = require('react-native-ssb-client-keys');
const pull = require('pull-stream');
const delay = require('delay');
const muxrpc = require('muxrpc');
const Config = require('ssb-config/inject');
const MultiServer = require('multiserver');
const workerPlugin = require('multiserver-worker');
const createClient = require('ssb-client');

const ms = MultiServer([workerPlugin({worker: self})]);

const keysPromise = new Promise(resolve => {
  let retryPeriod = 400;
  ssbKeys.load(ssbKeysPath, function done(err: any, keys: any) {
    if (!err && keys) {
      resolve(keys);
    } else {
      setTimeout(() => {
        retryPeriod *= 2;
        ssbKeys.load(ssbKeysPath, done);
      }, retryPeriod);
    }
  });
});

const ssbClientPromise = keysPromise.then(async function setupSSBClient(keys) {
  const config = Config('ssb');
  config.path = ssbPath;
  config.keys = keys;
  config.manifest = manifest;
  config.friends.hops = 2;
  let ssbClient = null;
  let timeoutPeriod = 800;
  let retryPeriod = 100;
  do {
    try {
      ssbClient = await new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          timeoutPeriod *= 2;
          return reject('timeout');
        }, timeoutPeriod);
        try {
          createClient(keys, config, (err: any, sbot: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(sbot);
            }
          });
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      await delay(retryPeriod);
      retryPeriod *= 2;
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

startSyncingNotifications(ssbClientPromise);
