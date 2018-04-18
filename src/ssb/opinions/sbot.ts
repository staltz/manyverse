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

import {Worker} from '@staltz/react-native-workers';
import {Readable} from '../../typings/pull-stream';
import {manifest} from '../manifest-client';
const pull = require('pull-stream');
const defer = require('pull-defer');
const {Value, onceTrue, watch, Set: MutantSet} = require('mutant');
const ref = require('ssb-ref');
const Reconnect = require('pull-reconnect');
const nest = require('depnest');
const createClient = require('ssb-client');
const createFeed = require('ssb-feed');
const ssbKeys = require('ssb-keys');
const muxrpc = require('muxrpc');
const MultiServer = require('multiserver');
const workerPlugin = require('multiserver-worker');
const pullMore = require('pull-more');

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
      publish: true,
      addBlob: true,
      gossipConnect: true,
      friendsGet: true,
    },
    pull: {
      publicThreads: true,
      profileThreads: true,
      thread: true,
      selfHistory: true,
      log: true,
      userFeed: true,
      messagesByType: true,
      feed: true,
      links: true,
      backlinks: true,
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

// We need this because react-native-workers constructor
// is non-standard and uses 3 arguments.
function OneArgWorker(path: string) {
  Worker.call(this, path, path, 8091);
}
OneArgWorker.prototype = Object.create(Worker.prototype);
OneArgWorker.prototype.constructor = OneArgWorker;

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
      workerPlugin({path: 'worker', ctor: OneArgWorker}),
    ]);

    ms.client('worker:worker', (err: any, stream: Readable<any>) => {
      if (err) {
        return notify(err);
      }
      const codec = (x: any) => x;
      const client = muxrpc(manifest, null, codec)();
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
          return pull(sbot.threads.thread(opts), pull.through(runHooks));
        }),
        selfHistory: rec.source((opts: any) => {
          return sbot.createHistoryStream({id: keys.id, ...opts});
        }),
        publicThreads: rec.source((opts: any) => {
          return pull(
            pullMore(
              sbot.threads.public,
              {limit: 3, threadMaxSize: 3, whitelist: ['post'], ...opts},
              ['messages', '0', 'value', 'timestamp'],
            ),
            pull.through(runHooks),
          );
        }),
        profileThreads: rec.source((opts: any) => {
          return pull(
            pullMore(
              sbot.threads.profile,
              {limit: 3, threadMaxSize: 3, whitelist: ['post'], ...opts},
              ['messages', '0', 'value', 'sequence'],
            ),
            pull.through(runHooks),
          );
        }),
        feed: rec.source((opts: any) => {
          return pull(
            pullMore(sbot.createFeedStream, {...opts, limit: 10}, [
              'value',
              'timestamp',
            ]),
            pull.through(runHooks),
          );
        }),
        log: rec.source((opts: any) => {
          return pull(sbot.createLogStream(opts), pull.through(runHooks));
        }),
        links: rec.source((query: any) => {
          return sbot.links(query);
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
