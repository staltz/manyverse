/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Readable} from '../../typings/pull-stream';
import {manifest} from '../manifest-client';
import {startSyncingNotifications} from '../syncing-notifications';
import {AboutContent, FeedId, MsgId} from 'ssb-typescript';
const pull = require('pull-stream');
const Notify = require('pull-notify');
const Ref = require('ssb-ref');
const nest = require('depnest');
const Defer = require('pull-defer');
const ssbKeys = require('react-native-ssb-client-keys');
const muxrpc = require('muxrpc');
const nodejs = require('nodejs-mobile-react-native');
const MultiServer = require('multiserver');
const rnChannelPlugin = require('multiserver-rn-channel');
const noAuthPlugin = require('multiserver/plugins/noauth');
const QuickLRU = require('quick-lru');

function toSodiumKeys(keys: any) {
  if (!keys || !keys.public) return null;
  return {
    publicKey: Buffer.from(keys.public.replace('.ed25519', ''), 'base64'),
    secretKey: Buffer.from(keys.private.replace('.ed25519', ''), 'base64'),
  };
}

function makeSbotOpinion(keys: any) {
  return {
    needs: nest({
      'sbot.hook.publish': 'map',
    }),

    gives: {
      sbot: {
        sync: {
          keys: true,
          invalidateAboutSocialValue: true,
        },
        async: {
          ssb: true,
          get: true,
          progress: true,
          publish: true,
          publishAbout: true,
          createDhtInvite: true,
          isFollowing: true,
          isBlocking: true,
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
          connPeers: true,
          connStagedPeers: true,
          nearbyBluetoothPeers: true,
          bluetoothScanState: true,
          hostingDhtInvites: true,
          claimingDhtInvites: true,
          aboutSocialValueStream: true,
        },
      },
    },

    create: (api: any) => {
      const DUNBAR = 150;
      const socialValueCache = {
        name: new QuickLRU({maxSize: DUNBAR}) as Map<FeedId, string>,
        image: new QuickLRU({maxSize: DUNBAR}) as Map<FeedId, any>,
      };

      const sbotP = new Promise<any>((resolve, reject) => {
        const ms = MultiServer([
          [
            rnChannelPlugin(nodejs.channel),
            noAuthPlugin({keys: toSodiumKeys(keys)}),
          ],
        ]);
        const address = 'channel~noauth:' + keys.public.replace('.ed25519', '');
        ms.client(address, (err: any, stream: Readable<any>) => {
          if (err) {
            reject(err);
          } else {
            const client = muxrpc(manifest, null)();
            pull(stream, client.createStream(), stream);
            resolve(client);
          }
        });
      });

      const syncingStream = Notify();
      sbotP.then(ssbClient => {
        pull(ssbClient.syncing.stream(), pull.drain(syncingStream));
        startSyncingNotifications(syncingStream.listen());
      });

      return {
        sbot: {
          sync: {
            keys: () => keys,
            invalidateAboutSocialValue: (feedId: FeedId) => {
              socialValueCache.name.delete(feedId);
              socialValueCache.image.delete(feedId);
            },
          },
          async: {
            ssb: (cb: any) => {
              sbotP.then(sbot => cb(null, sbot));
            },
            get: (key: any, cb: any) => {
              if (typeof cb !== 'function') {
                throw new Error('cb must be function');
              }
              sbotP.then(sbot => {
                sbot.get(key, (err: any, value: any) => {
                  if (err) return cb(err);
                  cb(null, value);
                });
              });
            },
            progress: (cb: any) => {
              sbotP.then(sbot => {
                sbot.progress(cb);
              });
            },
            publish: (content: any, cb: any) => {
              sbotP.then(sbot => {
                // instant updating of interface (just incase sbot is busy)
                runHooks({
                  timestamp: Date.now(),
                  value: {
                    timestamp: Date.now(),
                    author: keys.id,
                    content,
                  },
                });
                if (content.recps) {
                  content = ssbKeys.box(
                    content,
                    content.recps.map((e: any) => {
                      return Ref.isFeed(e) ? e : e.link;
                    }),
                  );
                } else if (content.mentions) {
                  content.mentions.forEach((mention: any) => {
                    if (Ref.isBlob(mention.link)) {
                      sbot.blobs.push(mention.link, (err: any) => {
                        if (err) console.error(err);
                      });
                    }
                  });
                }
                sbot.publish(content, (err: any, msg: any) => {
                  if (err) console.error(err);
                  if (cb) cb(err, msg);
                });
              });
            },
            publishAbout: (content: AboutContent, cb: any) => {
              sbotP.then(sbot => {
                if (content.image && !Ref.isBlobId(content.image[0])) {
                  sbot.blobsFromPath.add(
                    content.image,
                    (err: any, hash: string) => {
                      if (err) return console.error(err);
                      content.image = hash;
                      sbot.publish(content, (err2: any, msg: any) => {
                        if (err2) console.error(err2);
                        if (cb) cb(err2, msg);
                      });
                    },
                  );
                } else {
                  sbot.publish(content, (err: any, msg: any) => {
                    if (err) console.error(err);
                    if (cb) cb(err, msg);
                  });
                }
              });
            },
            createDhtInvite: (cb: any) => {
              sbotP.then(sbot => {
                sbot.dhtInvite.create(cb);
              });
            },
            isFollowing: (opts: any, cb: any) => {
              sbotP.then(sbot => {
                sbot.friends.isFollowing(opts, cb);
              });
            },
            isBlocking: (opts: any, cb: any) => {
              sbotP.then(sbot => {
                sbot.friends.isBlocking(opts, cb);
              });
            },
            aboutSocialValue: (opts: any, cb: any) => {
              if (opts.key === 'name' || opts.key === 'image') {
                const cache = socialValueCache[opts.key];
                const author = opts.dest;
                if (cache.has(author)) {
                  return cb(null, cache.get(author));
                } else {
                  sbotP.then(sbot => {
                    sbot.about.socialValue(opts, (err: any, val: string) => {
                      if (!err && !!val) cache.set(author, val);
                      cb(err, val);
                    });
                  });
                }
              } else {
                sbotP.then(sbot => {
                  sbot.about.socialValue(opts, cb);
                });
              }
            },
          },
          pull: {
            syncing: () => {
              return syncingStream.listen();
            },
            backlinks: (query: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.backlinks.read(query));
              });
              return deferred;
            },
            voterStream: (msgId: MsgId) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.votes.voterStream(msgId));
              });
              return deferred;
            },
            userFeed: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.createUserStream(opts));
              });
              return deferred;
            },
            thread: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.threads.thread(opts));
              });
              return deferred;
            },
            publicThreads: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.threads.public(opts));
              });
              return deferred;
            },
            publicUpdates: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.threads.publicUpdates(opts));
              });
              return deferred;
            },
            profileThreads: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.threads.profile(opts));
              });
              return deferred;
            },
            feed: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.createFeedStream(opts));
              });
              return deferred;
            },
            links: (query: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.links(query));
              });
              return deferred;
            },
            hostingDhtInvites: () => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.dhtInvite.hostingInvites());
              });
              return deferred;
            },
            connPeers: () => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.conn.peers());
              });
              return deferred;
            },
            connStagedPeers: () => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.conn.stagedPeers());
              });
              return deferred;
            },
            claimingDhtInvites: () => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.dhtInvite.claimingInvites());
              });
              return deferred;
            },
            aboutSocialValueStream: (opts: any) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.about.socialValueStream(opts));
              });
              return deferred;
            },
            nearbyBluetoothPeers: (refreshInterval: number) => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(
                  sbot.bluetooth.nearbyScuttlebuttDevices(refreshInterval),
                );
              });
              return deferred;
            },
            bluetoothScanState: () => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.bluetooth.bluetoothScanState());
              });
              return deferred;
            },
          },
        },
      };

      // scoped

      function runHooks(msg: any) {
        api.sbot.hook.publish(msg);
      }
    },
  };
}

export default makeSbotOpinion;
