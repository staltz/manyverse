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

import {Readable} from '../../typings/pull-stream';
import {manifest} from '../manifest-client';
import {startSyncingNotifications} from '../syncing-notifications';
const pull = require('pull-stream');
const defer = require('pull-defer');
const Notify = require('pull-notify');
const {Value, onceTrue, Set: MutantSet} = require('mutant');
const ref = require('ssb-ref');
const Reconnect = require('pull-reconnect');
const nest = require('depnest');
const createFeed = require('ssb-feed');
const ssbKeys = require('react-native-ssb-client-keys');
const muxrpc = require('muxrpc');
const nodejs = require('nodejs-mobile-react-native');
const MultiServer = require('multiserver');
const rnChannelPlugin = require('multiserver-rn-channel');
const noAuthPlugin = require('multiserver/plugins/noauth');

const needs = nest({
  'keys.sync.load': 'first',
  'sbot.obs.connectionStatus': 'first',
  'sbot.hook.publish': 'map',
});

const gives = {
  sbot: {
    sync: {
      cache: true,
    },
    async: {
      get: true,
      progress: true,
      publish: true,
      acceptInvite: true,
      acceptDhtInvite: true,
      createDhtInvite: true,
      addBlob: true,
      gossipConnect: true,
      friendsGet: true,
    },
    pull: {
      syncing: true,
      publicThreads: true,
      publicUpdates: true,
      profileThreads: true,
      thread: true,
      log: true,
      userFeed: true,
      messagesByType: true,
      feed: true,
      links: true,
      backlinks: true,
      hostingDhtInvites: true,
      claimingDhtInvites: true,
      stream: true,
    },
    obs: {
      connectionStatus: true,
      connection: true,
      // connectedPeers: true,
      localPeers: true,
    },
  },
};

function toSodiumKeys(keys: any) {
  if (!keys || !keys.public) return null;
  return {
    publicKey: Buffer.from(keys.public.replace('.ed25519', ''), 'base64'),
    secretKey: Buffer.from(keys.private.replace('.ed25519', ''), 'base64'),
  };
}

const create = (api: any) => {
  const keys = api.keys.sync.load();
  const cache = {};

  let sbot: any = null;
  const connection = Value();
  const connectionStatus = Value();
  const connectedPeers = MutantSet();
  const localPeers = MutantSet();

  const rec = Reconnect((isConn: any) => {
    function notify(value?: any) {
      isConn(value);
      connectionStatus.set(value);
    }

    const ms = MultiServer([
      [
        rnChannelPlugin(nodejs.channel),
        noAuthPlugin({
          keys: toSodiumKeys(keys),
        }),
      ],
    ]);

    const address = 'channel~noauth:' + keys.public.replace('.ed25519', '');

    ms.client(address, (err: any, stream: Readable<any>) => {
      if (err) {
        return notify(err);
      }
      const client = muxrpc(manifest, null)();
      pull(stream, client.createStream(), stream);
      sbot = client;
      sbot.on('closed', () => {
        sbot = null;
        connection.set(null);
        notify(new Error('closed'));
      });
      connection.set(sbot);

      notify();
    });
  });

  const internal = {
    getLatest: rec.async((id: any, cb: any) => {
      sbot.getLatest(id, cb);
    }),
    add: rec.async((msg: any, cb: any) => {
      sbot.add(msg, cb);
    }),
  };

  const feed = createFeed(internal, keys, {remote: true});

  const syncingStream = Notify();
  onceTrue(connection, (ssbClient: any) => {
    pull(ssbClient.syncing.stream(), pull.drain(syncingStream));
    startSyncingNotifications(syncingStream.listen());
  });

  return {
    sbot: {
      sync: {
        cache: () => cache,
      },
      async: {
        get: rec.async((key: any, cb: any) => {
          if (typeof cb !== 'function') {
            throw new Error('cb must be function');
          }
          if (cache[key]) cb(null, cache[key]);
          else {
            sbot.get(key, (err: any, value: any) => {
              if (err) return cb(err);
              runHooks({key, value});
              cb(null, value);
            });
          }
        }),
        progress: rec.async((cb: any) => {
          sbot.progress(cb);
        }),
        publish: rec.async((content: any, cb: any) => {
          if (!content) {
            if (cb) cb(new Error('invalid (falsy) content'));
            return;
          }
          if (content.recps) {
            content = ssbKeys.box(
              content,
              content.recps.map((e: any) => {
                return ref.isFeed(e) ? e : e.link;
              }),
            );
          } else if (content.mentions) {
            content.mentions.forEach((mention: any) => {
              if (ref.isBlob(mention.link)) {
                sbot.blobs.push(mention.link, (err: any) => {
                  if (err) console.error(err);
                });
              }
            });
          }
          if (sbot) {
            // instant updating of interface (just incase sbot is busy)
            runHooks({
              publishing: true,
              timestamp: Date.now(),
              value: {
                timestamp: Date.now(),
                author: keys.id,
                content,
              },
            });
          }
          feed.add(content, (err: any, msg: any) => {
            if (err) console.error(err);
            if (cb) cb(err, msg);
          });
        }),
        acceptInvite: rec.async((invite: string, cb: any) => {
          sbot.invite.accept(invite, cb);
        }),
        acceptDhtInvite: rec.async((invite: string, cb: any) => {
          sbot.dhtInvite.accept(invite, cb);
        }),
        createDhtInvite: rec.async((cb: any) => {
          sbot.dhtInvite.create(cb);
        }),
        addBlob: rec.async((stream: any, cb: any) => {
          return pull(stream, sbot.blobs.add(cb));
        }),
        gossipConnect: rec.async((opts: any, cb: any) => {
          sbot.gossip.connect(opts, cb);
        }),
        friendsGet: rec.async((opts: any, cb: any) => {
          sbot.friends.get(opts, cb);
        }),
      },
      pull: {
        syncing: rec.source(() => {
          return syncingStream.listen();
        }),
        backlinks: rec.source((query: any) => {
          return sbot.backlinks.read(query);
        }),
        userFeed: rec.source((opts: any) => {
          return sbot.createUserStream(opts);
        }),
        messagesByType: rec.source((opts: any) => {
          return sbot.messagesByType(opts);
        }),
        thread: rec.source((opts: any) => {
          return sbot.threads.thread(opts);
        }),
        publicThreads: rec.source((opts: any) => {
          return sbot.threads.public({
            threadMaxSize: 3,
            allowlist: ['post'],
            ...opts,
          });
        }),
        publicUpdates: rec.source((opts: any) => {
          return sbot.threads.publicUpdates({allowlist: ['post'], ...opts});
        }),
        profileThreads: rec.source((opts: any) => {
          return sbot.threads.profile({
            threadMaxSize: 3,
            allowlist: ['post'],
            ...opts,
          });
        }),
        feed: rec.source((opts: any) => {
          return sbot.createFeedStream(opts);
        }),
        log: rec.source((opts: any) => {
          return pull(sbot.createLogStream(opts), pull.through(runHooks));
        }),
        links: rec.source((query: any) => {
          return sbot.links(query);
        }),
        hostingDhtInvites: rec.source(() => {
          return sbot.dhtInvite.hostingInvites();
        }),
        claimingDhtInvites: rec.source(() => {
          return sbot.dhtInvite.claimingInvites();
        }),
        stream: (fn: any) => {
          const stream = defer.source();
          onceTrue(connection, (conn: any) => {
            stream.resolve(fn(conn));
          });
          return stream;
        },
      },
      obs: {
        connectionStatus: (listener: any) => connectionStatus(listener),
        connection,
        connectedPeers: () => connectedPeers,
        localPeers: () => localPeers,
      },
    },
  };

  // scoped

  function runHooks(msg: any) {
    if (msg.publishing) {
      api.sbot.hook.publish(msg);
    } else if (!cache[msg.key]) {
      // cache[msg.key] = msg.value
      // api.sbot.hook.feed(msg)
    }
  }
};

export default {needs, gives, create};
