/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PeerKV, StagedPeerKV} from '../types';
import {Callback} from 'pull-stream';
import run = require('promisify-tuple');
import {imageToImageUrl} from '../utils/from-ssb';
import {ClientAPI, AnyFunction} from 'react-native-ssb-client';
import manifest from '../manifest';
const pull = require('pull-stream');
const cat = require('pull-cat');
const backoff = require('pull-backoff');
const switchMap = require('pull-switch-map');
const combineLatest = require('pull-combine-latest');

type HostingDhtInvite = {seed: string; claimer: string; online: boolean};

type SSB = ClientAPI<
  typeof manifest & {
    cachedAbout: {
      socialValue: AnyFunction;
      invalidate: AnyFunction;
    };
  }
>;

function augmentPeerWithExtras(ssb: SSB) {
  const getAbout = ssb.cachedAbout.socialValue;
  return async ([addr, peer]: PeerKV, cb: Callback<[string, any]>) => {
    // Fetch name
    const nameOpts = {key: 'name', dest: peer.key};
    const [e1, name] = await run<string | undefined>(getAbout)(nameOpts);
    if (e1) return cb(e1);

    // Fetch avatar
    const avatarOpts = {key: 'image', dest: peer.key};
    const [e2, val] = await run(getAbout)(avatarOpts);
    if (e2) return cb(e2);
    const imageUrl = imageToImageUrl(val);

    // Fetch 'isInDB' boolean
    const [e4, isInDB] = await run<boolean>(ssb.connUtilsBack.isInDB)(addr);
    if (e4) return cb(e4);

    cb(null, [addr, {name, imageUrl, isInDB, ...peer}]);
  };
}

function augmentPeersWithExtras(ssb: SSB) {
  return async (kvs: Array<PeerKV>, cb: Callback<Array<PeerKV>>) => {
    const peers: Array<PeerKV> = [];
    for (const kv of kvs) {
      const [err, peer] = await run<any>(augmentPeerWithExtras(ssb))(kv);
      if (err) {
        cb(err);
        return;
      }
      peers.push(peer);
    }
    cb(null, peers);
  };
}

function removeOlderDuplicates(kvs: Array<PeerKV>) {
  // Only allow those that don't have a newer duplicate
  return kvs.filter(([_addr1, peer1]) => {
    const newerDuplicate = kvs.find(([_addr2, peer2]) => {
      if (!peer2.key) return false;
      if (peer2.key !== peer1.key) return false;
      if (peer1.hubUpdated && peer2.hubUpdated) {
        return peer2.hubUpdated > peer1.hubUpdated;
      }
      if (peer1.stagingUpdated && peer2.stagingUpdated) {
        return peer2.stagingUpdated > peer1.stagingUpdated;
      }
      return false;
    });
    return !newerDuplicate;
  });
}

const connUtils = {
  name: 'connUtils' as const,

  init: (ssb: SSB) => {
    return {
      persistentConnect(address: string, data: any, cb: Callback<any>) {
        return ssb.connUtilsBack.persistentConnect(address, data, cb);
      },

      persistentDisconnect(address: string, cb: Callback<any>) {
        return ssb.connUtilsBack.persistentDisconnect(address, cb);
      },

      isInDB(address: string, cb: Callback<boolean>) {
        return ssb.connUtilsBack.isInDB(address, cb);
      },

      peers() {
        return pull(
          ssb.conn.peers(),
          switchMap((peers: Array<PeerKV>) =>
            pull(
              cat([pull.once(0), backoff(2e3, 3.2, 60e3)]), // now, 2, 6, 20, 60
              pull.map(() => peers),
            ),
          ),
          pull.map(removeOlderDuplicates),
          pull.through((peers: Array<PeerKV>) => {
            for (const [, data] of peers) {
              if (data.key) ssb.cachedAbout.invalidate(data.key);
            }
          }),
          pull.asyncMap(augmentPeersWithExtras(ssb)),
        );
      },

      stagedPeers() {
        const connStagedPeers = pull(
          ssb.conn.stagedPeers(),
          pull.map(removeOlderDuplicates),
          pull.asyncMap(augmentPeersWithExtras(ssb)),
        );

        //#region DHT-related hacks (TODO ideally this should go through CONN)
        const hostingDHT = pull(
          cat([pull.values([[]]), ssb.dhtInvite.hostingInvites()]),
          pull.map((invites: Array<HostingDhtInvite>) =>
            invites
              .filter((invite) => !invite.online)
              .map(
                ({seed}) =>
                  [
                    `dht:${seed}:${ssb.id}`,
                    {key: seed, type: 'dht', role: 'server'},
                  ] as StagedPeerKV,
              ),
          ),
        );

        const stagedTotal = pull(
          combineLatest(connStagedPeers, hostingDHT),
          pull.map(([as, bs]: any) => [...as, ...bs]),
        );
        //#endregion

        return stagedTotal;
      },
    };
  },
};

export default () => connUtils;
