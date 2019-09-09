/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {AboutContent, FeedId, MsgId, Msg} from 'ssb-typescript';
import ssbClient from 'react-native-ssb-client';
import cachedAbout from 'ssb-cached-about';
import syncingNotifications from '../syncing-notifications';
import contactsPlugin from '../contacts';
import feedUtilsPlugin from '../feedUtils';
import manifest from '../manifest';
const Defer = require('pull-defer');

const hooksPlugin = {
  name: 'hooks',
  init: () => {
    const stream = xs.create<Msg>();
    return {
      publish: (msg: Msg) => {
        stream.shamefullySendNext(msg);
      },
      publishStream: () => stream,
    };
  },
};

function makeSbotOpinion(keys: any) {
  return {
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
          aboutSocialValue: true,
          getHooksPublishStream: true,
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
      const sbotP = ssbClient(keys, manifest)
        .use(hooksPlugin)
        .use(feedUtilsPlugin())
        .use(cachedAbout())
        .use(contactsPlugin())
        .use(syncingNotifications())
        .callPromise();

      return {
        sbot: {
          sync: {
            keys: () => keys,
            invalidateAboutSocialValue: (feedId: FeedId) => {
              sbotP.then(sbot => {
                sbot.cachedAbout.invalidate(feedId);
              });
            },
          },
          async: {
            ssb: (cb: any) => {
              sbotP.then(sbot => cb(null, sbot));
            },
            get: (key: any, cb: any) => {
              sbotP.then(sbot => {
                sbot.get(key, cb);
              });
            },
            progress: (cb: any) => {
              sbotP.then(sbot => {
                sbot.progress(cb);
              });
            },
            publish: (content: any, cb: any) => {
              sbotP.then(sbot => {
                sbot.feedUtils.publish(content, cb);
              });
            },
            publishAbout: (content: AboutContent, cb: any) => {
              sbotP.then(sbot => {
                sbot.feedUtils.publishAbout(content, cb);
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
            aboutSocialValue: (opts: any, cb: any) => {
              sbotP.then(sbot => {
                sbot.cachedAbout.socialValue(opts, cb);
              });
            },
            getHooksPublishStream: (cb: any) => {
              sbotP.then(sbot => {
                cb(null, sbot.hooks.publishStream());
              });
            },
          },
          pull: {
            syncing: () => {
              const deferred = Defer.source();
              sbotP.then(sbot => {
                deferred.resolve(sbot.syncing.stream());
              });
              return deferred;
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
    },
  };
}

export default makeSbotOpinion;
