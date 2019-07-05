/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, MemoryStream} from 'xstream';
import {Msg, Content, FeedId, About, MsgId, AboutContent} from 'ssb-typescript';
import {Peer as ConnQueryPeer} from 'ssb-conn-query/lib/types';
import {isMsg, isRootPostMsg, isReplyPostMsg} from 'ssb-typescript/utils';
import {Thread as ThreadData} from 'ssb-threads/types';
import makeKeysOpinion from '../../ssb/opinions/keys';
import sbotOpinion from '../../ssb/opinions/sbot';
import publishHookOpinion from '../../ssb/opinions/hook';
import contactOpinion = require('../../ssb/opinions/contact/obs');
import configOpinion from '../../ssb/opinions/config';
import {ssbKeysPath} from '../../ssb/defaults';
import xsFromCallback from 'xstream-from-callback';
import runAsync = require('promisify-tuple');
import xsFromPullStream from 'xstream-from-pull-stream';
import {Readable, Callback} from '../../typings/pull-stream';
import {shortFeedId, imageToImageUrl} from '../../ssb/from-ssb';
const pull = require('pull-stream');
const cat = require('pull-cat');
const ssbKeys = require('react-native-ssb-client-keys');
const depjectCombine = require('depject');
const colorHash = new (require('color-hash'))();

export type MsgAndExtras<C = Content> = Msg<C> & {
  value: {
    _$manyverse$metadata: {
      likes: Stream<Array<FeedId>>;
      about: {
        name: string;
        imageUrl: string | null;
      };
      contact?: {
        name: string;
      };
    };
  };
};

export type ThreadAndExtras = {
  messages: Array<MsgAndExtras>;
  full: boolean;
  errorReason?: 'blocked' | 'missing' | 'unknown';
};

export type AboutAndExtras = About & {
  id: FeedId;
  followsYou?: boolean;
};

export type PeerKV = ConnQueryPeer;

export type StagedPeerMetadata = {
  key: string;
  type: 'lan' | 'dht' | 'internet' | 'bt';
  role?: 'client' | 'server';
  note?: string;
};

export type StagedPeerKV = [string, StagedPeerMetadata];

function mutateMsgWithLiveExtras(api: any) {
  return (msg: Msg, cb: Callback<MsgAndExtras>) => {
    if (!isMsg(msg) || !msg.value) return cb(null, msg as any);
    const aboutSocialValue = api.sbot.async.aboutSocialValue[0];
    const nameOpts = {key: 'name', dest: msg.value.author};
    aboutSocialValue(nameOpts, (e1: any, nameResult: string) => {
      if (e1) return cb(e1);
      const name = nameResult || shortFeedId(msg.value.author);
      const avatarOpts = {key: 'image', dest: msg.value.author};
      aboutSocialValue(avatarOpts, (e2: any, val: any) => {
        if (e2) return cb(e2);
        const imageUrl = imageToImageUrl(val);
        const likes = xsFromPullStream(
          api.sbot.pull.voterStream[0](msg.key),
        ).startWith([]);
        const m = msg as MsgAndExtras;
        m.value._$manyverse$metadata = m.value._$manyverse$metadata || {
          likes,
          about: {name, imageUrl},
        };
        const content = msg.value.content;
        if (content && content.type === 'contact' && content.contact) {
          const dest: FeedId = content.contact;
          const destOpts = {key: 'name', dest};
          aboutSocialValue(destOpts, (e3: any, nameResult2: string) => {
            if (e3) return cb(e3);
            const destName = nameResult2 || shortFeedId(dest);
            m.value._$manyverse$metadata.contact = {name: destName};
            cb(null, m);
          });
        } else {
          cb(null, m);
        }
      });
    });
  };
}

function mutateThreadWithLiveExtras(api: any) {
  return async (thread: ThreadData, cb: Callback<ThreadAndExtras>) => {
    for (const msg of thread.messages) {
      await runAsync(mutateMsgWithLiveExtras(api))(msg);
    }
    cb(null, thread as ThreadAndExtras);
  };
}

function augmentPeerWithExtras(api: any) {
  return (kv: PeerKV, cb: Callback<[string, any]>) => {
    const peer = kv[1];
    const aboutSocialValue = api.sbot.async.aboutSocialValue[0];
    const nameOpts = {key: 'name', dest: peer.key};
    aboutSocialValue(nameOpts, (e1: any, nameResult: string) => {
      if (e1) return cb(e1);
      const name = nameResult || (peer.key ? shortFeedId(peer.key) : kv[0]);
      const avatarOpts = {key: 'image', dest: peer.key};
      aboutSocialValue(avatarOpts, (e2: any, val: any) => {
        if (e2) return cb(e2);
        const imageUrl = imageToImageUrl(val);
        cb(null, [kv[0], {...peer, name, imageUrl}]);
      });
    });
  };
}

function augmentPeersWithExtras(api: any) {
  return async (kvs: Array<PeerKV>, cb: Callback<Array<PeerKV>>) => {
    const peers: Array<PeerKV> = [];
    for (const kv of kvs) {
      const [err, peer] = await runAsync<any>(augmentPeerWithExtras(api))(kv);
      if (err) {
        cb(err);
        return;
      }
      peers.push(peer);
    }
    cb(null, peers);
  };
}

export type GetReadable<T> = (opts?: any) => Readable<T>;

export type HostingDhtInvite = {seed: string; claimer: string; online: boolean};

export class SSBSource {
  public selfFeedId$: MemoryStream<FeedId>;
  public publicRawFeed$: Stream<GetReadable<MsgAndExtras>>;
  public publicFeed$: Stream<GetReadable<ThreadAndExtras>>;
  public publicLiveUpdates$: Stream<null>;
  public isSyncing$: Stream<boolean>;
  public selfRoots$: Stream<GetReadable<ThreadAndExtras>>;
  public selfReplies$: Stream<GetReadable<MsgAndExtras>>;
  public publishHook$: Stream<Msg>;
  public acceptInviteResponse$: Stream<true | string>;
  public acceptDhtInviteResponse$: Stream<true | string>;
  public hostingDhtInvites$: Stream<Array<HostingDhtInvite>>;
  public peers$: Stream<Array<PeerKV>>;
  public stagedPeers$: Stream<Array<StagedPeerKV>>;
  public bluetoothScanState$: Stream<any>;

  constructor(private api$: Stream<any>) {
    this.selfFeedId$ = api$.map(api => api.keys.sync.id[0]()).remember();

    this.publicRawFeed$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.feed[0]({reverse: true, live: false, ...opts}),
        pull.asyncMap(mutateMsgWithLiveExtras(api)),
      ),
    );

    this.publicFeed$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.publicThreads[0]({
          threadMaxSize: 3,
          allowlist: ['post', 'contact'],
          reverse: true,
          live: false,
          ...opts,
        }),
        pull.asyncMap(mutateThreadWithLiveExtras(api)),
      ),
    );

    this.publicLiveUpdates$ = api$
      .map(api =>
        xsFromPullStream(
          api.sbot.pull.publicUpdates[0]({
            allowlist: ['post', 'contact'],
          }),
        ),
      )
      .flatten()
      .mapTo(null);

    this.isSyncing$ = api$
      .map(api => xsFromPullStream(api.sbot.pull.syncing[0]()))
      .flatten()
      .map((resp: any) => resp.started > 0);

    this.selfRoots$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.userFeed[0]({id: api.keys.sync.id[0](), ...opts}),
        pull.filter(isRootPostMsg),
        pull.map((msg: Msg) => ({messages: [msg], full: true} as ThreadData)),
        pull.asyncMap(mutateThreadWithLiveExtras(api)),
      ),
    );

    this.selfReplies$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.userFeed[0]({id: api.keys.sync.id[0](), ...opts}),
        pull.filter(isReplyPostMsg),
        pull.asyncMap(mutateMsgWithLiveExtras(api)),
      ),
    );

    this.publishHook$ = api$
      .map(api => api.sbot.hook.publishStream[0]() as Stream<Msg>)
      .flatten();

    this.hostingDhtInvites$ = api$
      .map(api =>
        xsFromPullStream<Array<HostingDhtInvite>>(
          api.sbot.pull.hostingDhtInvites[0](),
        ),
      )
      .flatten();

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.acceptDhtInviteResponse$ = xs.create<true | string>();

    this.peers$ = api$
      .map(api =>
        xsFromPullStream<Array<PeerKV>>(api.sbot.pull.connPeers[0]())
          .map(peers =>
            xsFromCallback<Array<PeerKV>>(augmentPeersWithExtras(api))(peers),
          )
          .flatten(),
      )
      .flatten();

    this.stagedPeers$ = api$
      .map(api =>
        xsFromPullStream<Array<StagedPeerKV>>(
          api.sbot.pull.connStagedPeers[0](),
        ),
      )
      .flatten();

    this.bluetoothScanState$ = api$
      .map(api => xsFromPullStream<any>(api.sbot.pull.bluetoothScanState[0]()))
      .flatten();
  }

  public thread$(rootMsgId: MsgId): Stream<ThreadAndExtras> {
    const apiToThread = (api: any, cb: any) => {
      pull(
        api.sbot.pull.thread[0]({root: rootMsgId}),
        pull.asyncMap(mutateThreadWithLiveExtras(api)),
        pull.take(1),
        pull.drain(
          (thread: ThreadAndExtras) => cb(null, thread),
          (err: any) => (err ? cb(err) : void 0),
        ),
      );
    };
    const apiToThread$ = xsFromCallback<ThreadAndExtras>(apiToThread);
    return this.api$.map(apiToThread$).flatten();
  }

  public profileFeed$(id: FeedId): Stream<GetReadable<ThreadAndExtras>> {
    return this.api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.profileThreads[0]({
          id,
          reverse: true,
          live: false,
          threadMaxSize: 3,
          allowlist: ['post', 'contact'],
          ...opts,
        }),
        pull.asyncMap(mutateThreadWithLiveExtras(api)),
      ),
    );
  }

  public profileAbout$(id: FeedId): Stream<AboutAndExtras> {
    return this.api$
      .map(api => {
        const selfId = api.keys.sync.id[0]();
        const color = colorHash.hex(id);
        const aboutSocialValue = api.sbot.async.aboutSocialValue[0];
        const aboutSocialValue$ = xsFromCallback(aboutSocialValue);
        const name$ = aboutSocialValue$({key: 'name', dest: id});
        const imageUrl$ = aboutSocialValue$({key: 'image', dest: id}).map(
          imageToImageUrl,
        );
        const description$ = aboutSocialValue$({key: 'description', dest: id});
        const following$ = api.contact.obs.tristate[0](selfId, id);
        const followsYou$ = api.contact.obs.tristate[0](id, selfId);
        return xs
          .combine(name$, imageUrl$, description$, following$, followsYou$)
          .map(
            ([name, imageUrl, description, following, followsYou]) =>
              ({
                id,
                name,
                color,
                imageUrl,
                description,
                following,
                followsYou,
              } as AboutAndExtras),
          );
      })
      .flatten();
  }

  public profileAboutLive$(id: FeedId): Stream<AboutAndExtras> {
    return this.api$
      .map(api => {
        const selfId = api.keys.sync.id[0]();
        const color = colorHash.hex(id);
        const aboutPS = api.sbot.pull.aboutSocialValueStream[0];
        const name$ = xsFromPullStream(aboutPS({key: 'name', dest: id}));
        const imageUrl$ = xsFromPullStream(
          aboutPS({key: 'image', dest: id}),
        ).map(imageToImageUrl);
        const description$ = xsFromPullStream(
          aboutPS({key: 'description', dest: id}),
        );
        const following$ = api.contact.obs.tristate[0](selfId, id);
        const followsYou$ = api.contact.obs.tristate[0](id, selfId);
        return xs
          .combine(name$, imageUrl$, description$, following$, followsYou$)
          .map(
            ([name, imageUrl, description, following, followsYou]) =>
              ({
                id,
                name,
                color,
                imageUrl,
                description,
                following,
                followsYou,
              } as AboutAndExtras),
          );
      })
      .flatten();
  }

  public isPrivatelyBlocking$(dest: FeedId): Stream<boolean> {
    return this.api$
      .map((api: any) => {
        const source = api.keys.sync.id[0]();
        return xsFromPullStream<boolean>(
          pull(
            cat([
              pull(
                api.sbot.pull.links[0]({
                  source,
                  dest,
                  rel: 'contact',
                  live: false,
                  reverse: true,
                }),
                pull.take(1),
              ),
              api.sbot.pull.links[0]({
                source,
                dest,
                rel: 'contact',
                old: false,
                live: true,
              }),
            ]),
            pull.asyncMap((link: any, cb2: any) => {
              api.sbot.async.get[0](link.key, cb2);
            }),
            pull.map((val: Msg['value']) => typeof val.content === 'string'),
          ),
        );
      })
      .flatten();
  }

  public createDhtInvite$(): Stream<string> {
    return this.api$
      .map(api => xsFromCallback<string>(api.sbot.async.createDhtInvite[0])())
      .flatten();
  }
}

export type PublishReq = {
  type: 'publish';
  content: Content;
};

export type PublishAboutReq = {
  type: 'publishAbout';
  content: AboutContent;
};

export type AcceptInviteReq = {
  type: 'invite.accept';
  invite: string;
};

export type StartDhtReq = {
  type: 'dhtInvite.start';
};

export type AcceptDhtInviteReq = {
  type: 'dhtInvite.accept';
  invite: string;
};

export type RemoveDhtInviteReq = {
  type: 'dhtInvite.remove';
  invite: string;
};

export type EnableBluetoothReq = {
  type: 'bluetooth.enable';
  interval: number;
};

export type DisableBluetoothReq = {
  type: 'bluetooth.disable';
  interval: number;
};

export type SearchBluetoothReq = {
  type: 'bluetooth.search';
  interval: number;
};

export type ConnectBluetoothReq = {
  type: 'bluetooth.connect';
  address: string;
};

export type Req =
  | PublishReq
  | PublishAboutReq
  | AcceptInviteReq
  | StartDhtReq
  | AcceptDhtInviteReq
  | RemoveDhtInviteReq
  | EnableBluetoothReq
  | DisableBluetoothReq
  | SearchBluetoothReq
  | ConnectBluetoothReq;

function dropCompletion(stream: Stream<any>): Stream<any> {
  return xs.merge(stream, xs.never());
}

export function contentToPublishReq(content: Content): PublishReq {
  return {type: 'publish', content};
}

export function ssbDriver(sink: Stream<Req>): SSBSource {
  const keys$ = xs
    .throw(new Error('keep retrying ssbKeys.load() until it works'))
    .replaceError(() => xsFromCallback(ssbKeys.load)(ssbKeysPath));

  const api$ = keys$
    .take(1)
    .compose(dropCompletion)
    .map(keys => {
      return depjectCombine([
        publishHookOpinion,
        configOpinion,
        makeKeysOpinion(keys),
        sbotOpinion,
        contactOpinion,
      ]);
    })
    .remember();

  const source = new SSBSource(api$);

  // Consume the sink
  api$
    .map(api => sink.map(req => [api, req] as [any, Req]))
    .flatten()
    .addListener({
      next: async ([api, req]) => {
        if (req.type === 'publish') {
          api.sbot.async.publish[0](req.content);
        }
        if (req.type === 'publishAbout') {
          api.sbot.async.publishAbout[0](req.content, () => {
            const selfId = api.keys.sync.id[0]();
            api.sbot.sync.invalidateAboutSocialValue[0](selfId);
          });
        }
        if (req.type === 'invite.accept') {
          api.sbot.async.acceptInvite[0](req.invite, (err: any, val: any) => {
            if (err) {
              source.acceptInviteResponse$._n(err.message || err);
            } else {
              source.acceptInviteResponse$._n(true);
            }
          });
        }
        if (req.type === 'dhtInvite.start') {
          api.sbot.async.startDht[0]((err: any, v: any) => {
            if (err) console.error(err.message || err);
          });
        }
        if (req.type === 'bluetooth.enable') {
          api.sbot.sync.enableBluetooth[0]();
        }
        if (req.type === 'bluetooth.disable') {
          api.sbot.sync.disableBluetooth[0]();
        }
        if (req.type === 'bluetooth.search') {
          api.sbot.async.searchBluetoothPeers[0](req.interval, (err: any) => {
            if (err) console.error(err.message || err);
          });
        }
        if (req.type === 'bluetooth.connect') {
          // connect
          const addr = req.address;
          const [err] = await runAsync(api.sbot.async.connConnect[0])(addr, {
            type: 'bt',
          });
          if (err) return console.error(err.message || err);

          // check if following
          const selfId = api.keys.sync.id[0]();
          const friendId = '@' + addr.split('shs:')[1] + '.ed25519';
          const opts = {source: selfId, dest: friendId};
          const [err2, f] = await runAsync(api.sbot.async.isFollowing[0])(opts);
          if (err2) return console.error(err2.message || err2);
          if (f) return;

          // follow
          const msg = {type: 'contact', contact: friendId, following: true};
          const [err3] = await runAsync(api.sbot.async.publish[0])(msg);
          if (err3) return console.error(err3.message || err3);
        }
        if (req.type === 'dhtInvite.accept') {
          api.sbot.async.acceptDhtInvite[0](req.invite, (err: any, v: any) => {
            if (err) {
              source.acceptDhtInviteResponse$._n(err.message || err);
            } else {
              source.acceptDhtInviteResponse$._n(true);
            }
          });
        }
        if (req.type === 'dhtInvite.remove') {
          api.sbot.async.removeDhtInvite[0](req.invite, (err: any, v: any) => {
            if (err) console.error(err.message || err);
          });
        }
      },
    });

  return source;
}
