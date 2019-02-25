/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {Readable} from '../../typings/pull-stream';
import {manifest} from '../manifest-client';
import {startSyncingNotifications} from '../syncing-notifications';
import {AboutContent, FeedId, MsgId} from 'ssb-typescript';
const pull = require('pull-stream');
const Notify = require('pull-notify');
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
const QuickLRU = require('quick-lru');

const needs = nest({
  'keys.sync.load': 'first',
  'sbot.hook.publish': 'map',
});

const gives = {
  sbot: {
    sync: {
      cache: true,
      invalidateAboutSocialValue: true,
      enableBluetooth: true,
      disableBluetooth: true,
    },
    async: {
      get: true,
      progress: true,
      publish: true,
      publishAbout: true,
      acceptInvite: true,
      searchBluetoothPeers: true,
      startDht: true,
      acceptDhtInvite: true,
      createDhtInvite: true,
      removeDhtInvite: true,
      isFollowing: true,
      isBlocking: true,
      gossipPeers: true,
      gossipConnect: true,
      aboutSocialValue: true,
    },
    pull: {
      syncing: true,
      publicThreads: true,
      publicUpdates: true,
      profileThreads: true,
      thread: true,
      userFeed: true,
      feed: true,
      links: true,
      backlinks: true,
      voterStream: true,
      gossipChanges: true,
      nearbyBluetoothPeers: true,
      bluetoothScanState: true,
      hostingDhtInvites: true,
      claimingDhtInvites: true,
      aboutSocialValueStream: true,
    },
    obs: {
      bluetoothEnabled: true,
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

  let sbot: any = null;
  const bluetoothEnabled$ = xs.createWithMemory<boolean>();
  bluetoothEnabled$.shamefullySendNext(false);
  const sbot$ = xs.createWithMemory<any>();
  const DUNBAR = 150;
  const socialValueCache = {
    name: new QuickLRU({maxSize: DUNBAR}) as Map<FeedId, string>,
    image: new QuickLRU({maxSize: DUNBAR}) as Map<FeedId, any>,
  };

  const rec = Reconnect((isConn: any) => {
    function notify(value?: any) {
      isConn(value);
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
      sbot$.shamefullySendNext(sbot);
      sbot.on('closed', () => {
        sbot = null;
        sbot$.shamefullySendNext(sbot);
        notify(new Error('closed'));
      });

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
  sbot$.filter(s => !!s).take(1).subscribe({
    next: ssbClient => {
      pull(ssbClient.syncing.stream(), pull.drain(syncingStream));
      startSyncingNotifications(syncingStream.listen());
    },
  });

  return {
    sbot: {
      sync: {
        cache: () => ({}),
        invalidateAboutSocialValue: (feedId: FeedId) => {
          socialValueCache.name.delete(feedId);
          socialValueCache.image.delete(feedId);
        },
        enableBluetooth: () => {
          bluetoothEnabled$.shamefullySendNext(true);
        },
        disableBluetooth: () => {
          bluetoothEnabled$.shamefullySendNext(false);
        },
      },
      async: {
        get: rec.async((key: any, cb: any) => {
          if (typeof cb !== 'function') {
            throw new Error('cb must be function');
          }
          sbot.get(key, (err: any, value: any) => {
            if (err) return cb(err);
            cb(null, value);
          });
        }),
        progress: rec.async((cb: any) => {
          sbot.progress(cb);
        }),
        publish: rec.async((content: any, cb: any) => {
          if (!content) {
            if (cb) cb(new Error('invalid (falsy) content'));
            return;
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
          feed.add(content, (err: any, msg: any) => {
            if (err) console.error(err);
            if (cb) cb(err, msg);
          });
        }),
        publishAbout: rec.async((content: AboutContent, cb: any) => {
          if (content.image && !ref.isBlobId(content.image[0])) {
            sbot.blobsFromPath.add(content.image, (err: any, hash: string) => {
              if (err) return console.error(err);
              content.image = hash;
              feed.add(content, (err2: any, msg: any) => {
                if (err2) console.error(err2);
                if (cb) cb(err2, msg);
              });
            });
          } else {
            feed.add(content, (err: any, msg: any) => {
              if (err) console.error(err);
              if (cb) cb(err, msg);
            });
          }
        }),
        acceptInvite: rec.async((invite: string, cb: any) => {
          sbot.invite.accept(invite, cb);
        }),
        searchBluetoothPeers: rec.async((forTime: number, cb: any) => {
          sbot.bluetooth.makeDeviceDiscoverable(forTime, cb);
        }),
        startDht: rec.async((cb: any) => {
          sbot.dhtInvite.start(cb);
        }),
        acceptDhtInvite: rec.async((invite: string, cb: any) => {
          sbot.dhtInvite.accept(invite, cb);
        }),
        createDhtInvite: rec.async((cb: any) => {
          sbot.dhtInvite.create(cb);
        }),
        removeDhtInvite: rec.async((invite: string, cb: any) => {
          sbot.dhtInvite.remove(invite, cb);
        }),
        isFollowing: rec.async((opts: any, cb: any) => {
          sbot.friends.isFollowing(opts, cb);
        }),
        isBlocking: rec.async((opts: any, cb: any) => {
          sbot.friends.isBlocking(opts, cb);
        }),
        gossipPeers: rec.async((cb: any) => {
          sbot.gossip.peers(cb);
        }),
        gossipConnect: rec.async((opts: any, cb: any) => {
          sbot.gossip.connect(opts, cb);
        }),
        aboutSocialValue: rec.async((opts: any, cb: any) => {
          if (opts.key === 'name' || opts.key === 'image') {
            const cache = socialValueCache[opts.key];
            const author = opts.dest;
            if (cache.has(author)) {
              return cb(null, cache.get(author));
            } else {
              sbot.about.socialValue(opts, (err: any, val: string) => {
                if (!err) cache.set(author, val);
                cb(err, val);
              });
            }
          } else {
            sbot.about.socialValue(opts, cb);
          }
        }),
      },
      pull: {
        syncing: rec.source(() => {
          return syncingStream.listen();
        }),
        backlinks: rec.source((query: any) => {
          return sbot.backlinks.read(query);
        }),
        voterStream: rec.source((msgId: MsgId) => {
          return sbot.votes.voterStream(msgId);
        }),
        userFeed: rec.source((opts: any) => {
          return sbot.createUserStream(opts);
        }),
        thread: rec.source((opts: any) => {
          return sbot.threads.thread(opts);
        }),
        publicThreads: rec.source((opts: any) => {
          return sbot.threads.public(opts);
        }),
        publicUpdates: rec.source((opts: any) => {
          return sbot.threads.publicUpdates(opts);
        }),
        profileThreads: rec.source((opts: any) => {
          return sbot.threads.profile(opts);
        }),
        feed: rec.source((opts: any) => {
          return sbot.createFeedStream(opts);
        }),
        links: rec.source((query: any) => {
          return sbot.links(query);
        }),
        hostingDhtInvites: rec.source(() => {
          return sbot.dhtInvite.hostingInvites();
        }),
        gossipChanges: rec.source(() => {
          return sbot.gossip.changes();
        }),
        claimingDhtInvites: rec.source(() => {
          return sbot.dhtInvite.claimingInvites();
        }),
        aboutSocialValueStream: rec.source((opts: any) => {
          return sbot.about.socialValueStream(opts);
        }),
        nearbyBluetoothPeers: rec.source((refreshInterval: number) => {
          return sbot.bluetooth.nearbyScuttlebuttDevices(refreshInterval);
        }),
        bluetoothScanState: rec.source(() => {
          return sbot.bluetooth.bluetoothScanState();
        }),
      },
      obs: {
        bluetoothEnabled: () => bluetoothEnabled$,
      },
    },
  };

  // scoped

  function runHooks(msg: any) {
    if (msg.publishing) {
      api.sbot.hook.publish(msg);
    }
  }
};

export default {needs, gives, create};
