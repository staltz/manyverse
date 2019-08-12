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
  const aboutSocialValue = api.sbot.async.aboutSocialValue[0];
  return async (msg: Msg, cb: Callback<MsgAndExtras>) => {
    if (!isMsg(msg) || !msg.value) return cb(null, msg as any);

    // Fetch name
    const nameOpts = {key: 'name', dest: msg.value.author};
    const [e1, nameResult] = await runAsync(aboutSocialValue)(nameOpts);
    if (e1) return cb(e1);
    const name = nameResult || shortFeedId(msg.value.author);

    // Fetch avatar
    const avatarOpts = {key: 'image', dest: msg.value.author};
    const [e2, val] = await runAsync(aboutSocialValue)(avatarOpts);
    if (e2) return cb(e2);
    const imageUrl = imageToImageUrl(val);

    // Get likes stream
    const likes = xsFromPullStream(
      api.sbot.pull.voterStream[0](msg.key),
    ).startWith([]);

    // Create msg object
    const m = msg as MsgAndExtras;
    m.value._$manyverse$metadata = m.value._$manyverse$metadata || {
      likes,
      about: {name, imageUrl},
    };

    // Add name of the target contact, if any
    const content = msg.value.content;
    if (!content || content.type !== 'contact' || !content.contact) {
      return cb(null, m);
    }
    const dest: FeedId = content.contact;
    const dOpts = {key: 'name', dest};
    const [e3, nameResult2] = await runAsync<string>(aboutSocialValue)(dOpts);
    if (e3) return cb(e3);
    const destName = nameResult2 || shortFeedId(dest);
    m.value._$manyverse$metadata.contact = {name: destName};
    cb(null, m);
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
  const aboutSocialValue = api.sbot.async.aboutSocialValue[0];
  return async ([addr, peer]: PeerKV, cb: Callback<[string, any]>) => {
    // Fetch name
    const nameOpts = {key: 'name', dest: peer.key};
    const [e1, nameResult] = await runAsync(aboutSocialValue)(nameOpts);
    if (e1) return cb(e1);
    const name = nameResult || undefined;

    // Fetch avatar
    const avatarOpts = {key: 'image', dest: peer.key};
    const [e2, val] = await runAsync(aboutSocialValue)(avatarOpts);
    if (e2) return cb(e2);
    const imageUrl = imageToImageUrl(val);

    // Fetch 'isInDB' boolean
    const [e3, isInDB] = await runAsync(api.sbot.async.connIsInDB[0])(addr);
    if (e3) return cb(e3);

    cb(null, [addr, {name, imageUrl, isInDB, ...peer}]);
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
      .map(api => {
        const connPeers$ = xsFromPullStream<Array<PeerKV>>(
          api.sbot.pull.connPeers[0](),
        );

        //#region DHT-related hacks (ideally this should go through CONN)
        const selfId = api.keys.sync.id[0]();
        const dhtClientsArr$ = this.hostingDhtInvites$
          .map(invites =>
            invites
              .filter(invite => invite.online)
              .map(
                invite =>
                  [
                    `dht:${invite.seed}:${selfId}`,
                    {
                      pool: 'hub',
                      key: invite.claimer,
                      source: 'dht' as any,
                      client: true,
                      state: 'connected',
                    },
                  ] as PeerKV,
              ),
          )
          .startWith([]);
        const peersArr$ = xs
          .combine(connPeers$, dhtClientsArr$)
          .map(([as, bs]) => [...as, ...bs]);
        //#endregion

        const peersWithExtras$ = peersArr$
          .map(peersArr =>
            xsFromCallback<any>(augmentPeersWithExtras(api))(peersArr),
          )
          .flatten();

        return peersWithExtras$;
      })
      .flatten();

    this.stagedPeers$ = api$
      .map(api => {
        const connStagedPeers$ = xsFromPullStream<Array<StagedPeerKV>>(
          api.sbot.pull.connStagedPeers[0](),
        )
          .map(peersArr =>
            xsFromCallback<any>(augmentPeersWithExtras(api))(peersArr),
          )
          .flatten();

        //#region DHT-related hacks (ideally this should go through CONN)
        const selfId = api.keys.sync.id[0]();
        const hosting$ = this.hostingDhtInvites$
          .map(invites =>
            invites
              .filter(invite => !invite.online)
              .map(
                ({seed}) =>
                  [
                    `dht:${seed}:${selfId}`,
                    {key: seed, type: 'dht', role: 'server'},
                  ] as StagedPeerKV,
              ),
          )
          .startWith([]);
        const claiming$: Stream<Array<StagedPeerKV>> = xsFromPullStream(
          api.sbot.pull.claimingDhtInvites[0](),
        )
          .map((invites: Array<string>) =>
            invites.map(
              invite =>
                [
                  invite,
                  {key: invite, type: 'dht', role: 'client'},
                ] as StagedPeerKV,
            ),
          )
          .startWith([]);
        const peersArr$ = xs
          .combine(connStagedPeers$, hosting$, claiming$)
          .map(([as, bs, cs]) => [...as, ...bs, ...cs]);
        //#endregion

        return peersArr$;
      })
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

export type ConnConnectReq = {
  type: 'conn.connect';
  address: string;
  hubData?: any;
};

export type ConnRememberConnectReq = {
  type: 'conn.rememberConnect';
  address: string;
  data?: any;
};

export type ConnFollowConnectReq = {
  type: 'conn.followConnect';
  address: string;
  key?: string;
  hubData?: any;
};

export type ConnDisconnectReq = {
  type: 'conn.disconnect';
  address: string;
};

export type ConnDisconnectForgetReq = {
  type: 'conn.disconnectForget';
  address: string;
};

export type ConnForgetReq = {
  type: 'conn.forget';
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
  | ConnConnectReq
  | ConnRememberConnectReq
  | ConnFollowConnectReq
  | ConnDisconnectReq
  | ConnDisconnectForgetReq
  | ConnForgetReq;

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
          api.sbot.async.startDht[0]((err: any) => {
            if (err) console.error(err.message || err);
          });
        }
        if (req.type === 'conn.connect') {
          // connect
          const addr = req.address;
          const [err, result] = await runAsync(
            api.sbot.async.connPersistentConnect[0],
          )(addr, req.hubData || {});
          if (err) return console.error(err.message || err);
          if (!result) return console.error(`connecting to ${addr} failed`);
        }
        if (req.type === 'conn.rememberConnect') {
          // remember
          const addr = req.address;
          const [e1] = await runAsync(api.sbot.async.connRemember[0])(
            addr,
            req.data || {},
          );
          if (e1) return console.error(e1.message || e1);

          // connect
          const [e2, result] = await runAsync(
            api.sbot.async.connPersistentConnect[0],
          )(addr, req.data || {});
          if (e2) return console.error(e2.message || e2);
          if (!result) return console.error(`connecting to ${addr} failed`);
          // TODO show this error as a Toast
        }
        if (req.type === 'conn.followConnect') {
          // connect
          const addr = req.address;
          const [e1, result] = await runAsync(
            api.sbot.async.connPersistentConnect[0],
          )(addr, req.hubData || {});
          if (e1) return console.error(e1.message || e1);
          if (!result) return console.error(`connecting to ${addr} failed`);
          // TODO show this error as a Toast

          // check if following
          const selfId = api.keys.sync.id[0]();
          const friendId = req.key || '@' + addr.split('shs:')[1] + '.ed25519';
          const opts = {source: selfId, dest: friendId};
          const [e2, alreadyFollow] = await runAsync<boolean>(
            api.sbot.async.isFollowing[0],
          )(opts);
          if (e2) return console.error(e2.message || e2);
          if (alreadyFollow) return;

          // follow
          const msg = {type: 'contact', contact: friendId, following: true};
          const [e3] = await runAsync(api.sbot.async.publish[0])(msg);
          if (e3) return console.error(e3.message || e3);
        }
        if (req.type === 'conn.disconnect') {
          const addr = req.address;
          const [err] = await runAsync(
            api.sbot.async.connPersistentDisconnect[0],
          )(addr);
          if (err) return console.error(err.message || err);
        }
        if (req.type === 'conn.disconnectForget') {
          const addr = req.address;

          // forget
          const [e1] = await runAsync(api.sbot.async.connForget[0])(addr);
          if (e1) console.error(e1.message || e1);

          // disconnect
          const [e2] = await runAsync(
            api.sbot.async.connPersistentDisconnect[0],
          )(addr);
          if (e2) console.error(e2.message || e2);
        }
        if (req.type === 'conn.forget') {
          const addr = req.address;
          const [e1] = await runAsync(api.sbot.async.connUnstage[0])(addr);
          if (e1) console.error(e1.message || e1);
          const [e2] = await runAsync(api.sbot.async.connForget[0])(addr);
          if (e2) console.error(e2.message || e2);
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
