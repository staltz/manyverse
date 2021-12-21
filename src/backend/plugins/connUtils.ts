// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Callback} from './helpers/types';
import {Peer as PeerKV} from 'ssb-conn-query/lib/types';
import ConnDB = require('ssb-conn-db');
import {FeedId} from 'ssb-typescript';
const pull = require('pull-stream');
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');

interface AboutSelf {
  getProfile(feedId: FeedId): {
    name?: string;
    image?: string;
    description?: string;
  } | null;
}

function augmentPeerWithExtras(
  kv: PeerKV,
  connDB: ConnDB,
  aboutSelf: AboutSelf,
): PeerKV {
  const [addr, peer] = kv;
  if (!peer.key) return kv;
  const output = aboutSelf.getProfile(peer.key);
  if (!output) return kv;
  const name = output.name;
  const imageUrl = output.image ? blobIdToUrl(output.image) : void 0;
  const isInDB = connDB.has(addr);
  return [addr, {name, imageUrl, isInDB, ...peer}];
}

function augmentPeersWithExtras(ssb: any) {
  return (kvs: Array<PeerKV>, cb: Callback<Array<PeerKV>>) => {
    let done = false;
    ssb.db.onDrain('aboutSelf', () => {
      if (!done) {
        done = true;
        const aboutSelf = ssb.db.getIndex('aboutSelf');
        const connDB = ssb.conn.db();
        const newKVs = kvs.map((kv) =>
          augmentPeerWithExtras(kv, connDB, aboutSelf),
        );
        cb(null, newKVs);
      }
    });
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

export = {
  name: 'connUtils',
  version: '1.0.0',
  manifest: {
    persistentConnect: 'async',
    persistentDisconnect: 'async',
    peers: 'source',
    stagedPeers: 'source',
  },
  permissions: {
    master: {
      allow: [
        'persistentConnect',
        'persistentDisconnect',
        'peers',
        'stagedPeers',
      ],
    },
  },
  init: function init(ssb: any) {
    return {
      persistentConnect(address: string, data: any, cb: Callback<any>) {
        // if we had 'autoconnect=false', then make it true
        ssb.conn.db().update(address, (prev: any) => {
          if (!prev.autoconnect) return {autoconnect: true};
          else return {};
        });

        ssb.conn.connect(address, data, cb);
      },

      persistentDisconnect(address: string, cb: Callback<any>) {
        // if we had 'autoconnect=true', then make it false
        ssb.conn.db().update(address, (prev: any) => {
          if (prev.autoconnect) return {autoconnect: false};
          else return {};
        });

        // disconnect
        ssb.conn.disconnect(address, cb);
      },

      peers() {
        return pull(
          ssb.conn.peers(),
          pull.map(removeOlderDuplicates),
          pull.asyncMap(augmentPeersWithExtras(ssb)),
        );
      },

      stagedPeers() {
        return pull(
          ssb.conn.stagedPeers(),
          pull.map(removeOlderDuplicates),
          pull.asyncMap(augmentPeersWithExtras(ssb)),
        );
      },
    };
  },
};
