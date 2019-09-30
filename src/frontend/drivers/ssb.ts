/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, MemoryStream} from 'xstream';
import backoff from 'xstream-backoff';
import {
  Msg,
  Content,
  FeedId,
  About,
  MsgId,
  AboutContent,
  BlobId,
} from 'ssb-typescript';
import {isMsg, isRootPostMsg, isReplyPostMsg} from 'ssb-typescript/utils';
import {Thread as ThreadData} from 'ssb-threads/types';
import xsFromCallback from 'xstream-from-callback';
import runAsync = require('promisify-tuple');
import xsFromPullStream from 'xstream-from-pull-stream';
import {Readable, Callback} from 'pull-stream';
import makeClient from '../ssb/client';
import {PeerKV, StagedPeerKV, HostingDhtInvite} from '../ssb/types';
import {shortFeedId, imageToImageUrl} from '../ssb/utils/from-ssb';
const pull = require('pull-stream');
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

function mutateMsgWithLiveExtras(ssb: any) {
  const getAbout = ssb.cachedAbout.socialValue;
  return async (msg: Msg, cb: Callback<MsgAndExtras>) => {
    if (!isMsg(msg) || !msg.value) return cb(null, msg as any);

    // Fetch name
    const nameOpts = {key: 'name', dest: msg.value.author};
    const [e1, nameResult] = await runAsync(getAbout)(nameOpts);
    if (e1) return cb(e1);
    const name = nameResult || shortFeedId(msg.value.author);

    // Fetch avatar
    const avatarOpts = {key: 'image', dest: msg.value.author};
    const [e2, val] = await runAsync(getAbout)(avatarOpts);
    if (e2) return cb(e2);
    const imageUrl = imageToImageUrl(val);

    // Get likes stream
    const likes = xsFromPullStream(ssb.votes.voterStream(msg.key)).startWith(
      [],
    );

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
    const [e3, nameResult2] = await runAsync<string>(getAbout)(dOpts);
    if (e3) return cb(e3);
    const destName = nameResult2 || shortFeedId(dest);
    m.value._$manyverse$metadata.contact = {name: destName};
    cb(null, m);
  };
}

function mutateThreadWithLiveExtras(ssb: any) {
  return async (thread: ThreadData, cb: Callback<ThreadAndExtras>) => {
    for (const msg of thread.messages) {
      await runAsync(mutateMsgWithLiveExtras(ssb))(msg);
    }
    cb(null, thread as ThreadAndExtras);
  };
}

function augmentPeerWithExtras(ssb: any) {
  const getAbout = ssb.cachedAbout.socialValue;
  return async ([addr, peer]: PeerKV, cb: Callback<[string, any]>) => {
    // Fetch name
    const nameOpts = {key: 'name', dest: peer.key};
    const [e1, nameResult] = await runAsync(getAbout)(nameOpts);
    if (e1) return cb(e1);
    const name = nameResult || undefined;

    // Fetch avatar
    const avatarOpts = {key: 'image', dest: peer.key};
    const [e2, val] = await runAsync(getAbout)(avatarOpts);
    if (e2) return cb(e2);
    const imageUrl = imageToImageUrl(val);

    // Fetch 'isInDB' boolean
    const [e4, isInDB] = await runAsync<boolean>(ssb.connUtils.isInDB)(addr);
    if (e4) return cb(e4);

    cb(null, [addr, {name, imageUrl, isInDB, ...peer}]);
  };
}

function augmentPeersWithExtras(ssb: any) {
  return async (kvs: Array<PeerKV>, cb: Callback<Array<PeerKV>>) => {
    const peers: Array<PeerKV> = [];
    for (const kv of kvs) {
      const [err, peer] = await runAsync<any>(augmentPeerWithExtras(ssb))(kv);
      if (err) {
        cb(err);
        return;
      }
      peers.push(peer);
    }
    cb(null, peers);
  };
}

function dropCompletion(stream: Stream<any>): Stream<any> {
  return xs.merge(stream, xs.never());
}

export type GetReadable<T> = (opts?: any) => Readable<T>;

export class SSBSource {
  private ssb$: Stream<any>;
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
  public peers$: Stream<Array<PeerKV>>;
  public stagedPeers$: Stream<Array<StagedPeerKV>>;
  public bluetoothScanState$: Stream<any>;

  constructor(ssbP: Promise<any>) {
    this.ssb$ = xs
      .fromPromise(ssbP)
      .compose(dropCompletion)
      .remember();

    this.selfFeedId$ = this.ssb$.map(ssb => ssb.id).remember();

    this.publicRawFeed$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.createFeedStream({reverse: true, live: false, ...opts}),
        pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
      ),
    );

    this.publicFeed$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.threads.public({
          threadMaxSize: 3,
          allowlist: ['post', 'contact'],
          reverse: true,
          live: false,
          ...opts,
        }),
        pull.asyncMap(mutateThreadWithLiveExtras(ssb)),
      ),
    );

    this.publicLiveUpdates$ = this.ssb$
      .map(ssb => ssb.threads.publicUpdates({allowlist: ['post', 'contact']}))
      .map(xsFromPullStream)
      .flatten()
      .mapTo(null);

    this.isSyncing$ = this.ssb$
      .map(ssb => ssb.syncing.stream())
      .map(xsFromPullStream)
      .flatten()
      .map((resp: any) => resp.started > 0);

    this.selfRoots$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.createUserStream({id: ssb.id, ...opts}),
        pull.filter(isRootPostMsg),
        pull.map((msg: Msg) => ({messages: [msg], full: true} as ThreadData)),
        pull.asyncMap(mutateThreadWithLiveExtras(ssb)),
      ),
    );

    this.selfReplies$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.createUserStream({id: ssb.id, ...opts}),
        pull.filter(isReplyPostMsg),
        pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
      ),
    );

    this.publishHook$ = this.ssb$
      .map(ssb => ssb.hooks.publishStream())
      .flatten();

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.acceptDhtInviteResponse$ = xs.create<true | string>();

    this.peers$ = this.ssb$
      .map(ssb =>
        xsFromPullStream<Array<PeerKV>>(ssb.conn.peers())
          .map(peers =>
            backoff(1e3, 2, 60e3)
              .startWith(0)
              .map(() => {
                for (const [, data] of peers) {
                  if (data.key) ssb.cachedAbout.invalidate(data.key);
                }
                return peers;
              }),
          )
          .flatten()
          .map(peersArr =>
            xsFromCallback<any>(augmentPeersWithExtras(ssb))(peersArr),
          )
          .flatten(),
      )
      .flatten();

    this.stagedPeers$ = this.ssb$
      .map(ssb => {
        const connStagedPeers$ = xsFromPullStream<Array<StagedPeerKV>>(
          ssb.conn.stagedPeers(),
        )
          .map(peersArr =>
            xsFromCallback<any>(augmentPeersWithExtras(ssb))(peersArr),
          )
          .flatten();

        //#region DHT-related hacks (ideally this should go through CONN)
        const hosting$ = xsFromPullStream<Array<HostingDhtInvite>>(
          ssb.dhtInvite.hostingInvites(),
        )
          .map(invites =>
            invites
              .filter(invite => !invite.online)
              .map(
                ({seed}) =>
                  [
                    `dht:${seed}:${ssb.id}`,
                    {key: seed, type: 'dht', role: 'server'},
                  ] as StagedPeerKV,
              ),
          )
          .startWith([]);
        const peersArr$ = xs
          .combine(connStagedPeers$, hosting$)
          .map(([as, bs]) => [...as, ...bs]);
        //#endregion

        return peersArr$;
      })
      .flatten();

    this.bluetoothScanState$ = this.ssb$
      .map(ssb => ssb.bluetooth.bluetoothScanState())
      .map(xsFromPullStream)
      .flatten();
  }

  public thread$(rootMsgId: MsgId): Stream<ThreadAndExtras> {
    const ssbToThread = (ssb: any, cb: any) => {
      pull(
        ssb.threads.thread({root: rootMsgId}),
        pull.asyncMap(mutateThreadWithLiveExtras(ssb)),
        pull.take(1),
        pull.drain(
          (thread: ThreadAndExtras) => cb(null, thread),
          (err: any) => (err ? cb(err) : void 0),
        ),
      );
    };
    const toThread$ = xsFromCallback<ThreadAndExtras>(ssbToThread);
    return this.ssb$.map(toThread$).flatten();
  }

  public profileFeed$(id: FeedId): Stream<GetReadable<ThreadAndExtras>> {
    return this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.threads.profile({
          id,
          reverse: true,
          live: false,
          threadMaxSize: 3,
          allowlist: ['post', 'contact'],
          ...opts,
        }),
        pull.asyncMap(mutateThreadWithLiveExtras(ssb)),
      ),
    );
  }

  public liteAbout$(ids: Array<FeedId>): Stream<Array<AboutAndExtras>> {
    return this.ssb$
      .map(async ssb => {
        const getAbout = ssb.cachedAbout.socialValue;
        const abouts: Array<AboutAndExtras> = [];
        for (const id of ids) {
          // Fetch name
          const [, result1] = await runAsync<string>(getAbout)({
            key: 'name',
            dest: id,
          });
          const name = result1 || shortFeedId(id);

          // Fetch avatar
          const [, result2] = await runAsync(getAbout)({
            key: 'image',
            dest: id,
          });
          const imageUrl = imageToImageUrl(result2);

          abouts.push({name, imageUrl, id});
        }
        return abouts;
      })
      .map(promise => xs.fromPromise(promise))
      .flatten();
  }

  public profileAbout$(id: FeedId): Stream<AboutAndExtras> {
    return this.ssb$
      .map(ssb => {
        const selfId = ssb.id;
        const color = colorHash.hex(id);
        const getAbout = ssb.cachedAbout.socialValue;
        const getAbout$ = xsFromCallback(getAbout);
        const name$ = getAbout$({key: 'name', dest: id});
        const imageUrl$ = getAbout$({key: 'image', dest: id}).map(
          imageToImageUrl,
        );
        const description$ = getAbout$({key: 'description', dest: id});
        const following$ = ssb.contacts.tristate(selfId, id);
        const followsYou$ = ssb.contacts.tristate(id, selfId);
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
    return this.ssb$
      .map(ssb => {
        const selfId = ssb.id;
        const color = colorHash.hex(id);
        const getAboutPS = ssb.about.socialValueStream;
        const name$ = xsFromPullStream(getAboutPS({key: 'name', dest: id}));
        const imageUrl$ = xsFromPullStream(
          getAboutPS({key: 'image', dest: id}),
        ).map(imageToImageUrl);
        const description$ = xsFromPullStream(
          getAboutPS({key: 'description', dest: id}),
        );
        const following$ = ssb.contacts.tristate(selfId, id);
        const followsYou$ = ssb.contacts.tristate(id, selfId);
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

  public addBlobFromPath$(path: string): Stream<BlobId> {
    return this.ssb$
      .map(ssb => xsFromCallback<BlobId>(ssb.blobsUtils.addFromPath)(path))
      .flatten();
  }

  public isPrivatelyBlocking$(dest: FeedId): Stream<boolean> {
    return this.ssb$
      .map((ssb: any) => ssb.friendsUtils.isPrivatelyBlockingStream(dest))
      .map(ps => xsFromPullStream<boolean>(ps))
      .flatten();
  }

  public createDhtInvite$(): Stream<string> {
    return this.ssb$
      .map(ssb => xsFromCallback<string>(ssb.dhtInvite.create)())
      .flatten();
  }
}

export type PublishReq = {
  type: 'publish';
  content: NonNullable<Content>;
};

export type PublishAboutReq = {
  type: 'publishAbout';
  content: AboutContent;
};

export type AcceptInviteReq = {
  type: 'invite.accept';
  invite: string;
};

export type AcceptDhtInviteReq = {
  type: 'dhtInvite.accept';
  invite: string;
};

export type RemoveDhtInviteReq = {
  type: 'dhtInvite.remove';
  invite: string;
};

export type SearchBluetoothReq = {
  type: 'bluetooth.search';
  interval: number;
};

export type ConnStartReq = {
  type: 'conn.start';
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
  | AcceptDhtInviteReq
  | RemoveDhtInviteReq
  | SearchBluetoothReq
  | ConnStartReq
  | ConnConnectReq
  | ConnRememberConnectReq
  | ConnFollowConnectReq
  | ConnDisconnectReq
  | ConnDisconnectForgetReq
  | ConnForgetReq;

export function contentToPublishReq(content: NonNullable<Content>): PublishReq {
  return {type: 'publish', content};
}

async function consumeSink(
  sink: Stream<Req>,
  source: SSBSource,
  ssbP: Promise<any>,
) {
  const ssb = await ssbP;

  sink.addListener({
    next: async req => {
      if (req.type === 'publish') {
        ssb.feedUtils.publish(req.content);
        return;
      }

      if (req.type === 'publishAbout') {
        ssb.feedUtils.publishAbout(req.content, () => {
          ssb.cachedAbout.invalidate(ssb.id);
        });
        return;
      }

      if (req.type === 'invite.accept') {
        ssb.invite.accept(req.invite, (err: any) => {
          source.acceptInviteResponse$._n(err ? err.message || err : true);
        });
        return;
      }

      if (req.type === 'conn.start') {
        const [err1] = await runAsync(ssb.conn.start)();
        if (err1) return console.error(err1.message || err1);

        const [err2] = await runAsync(ssb.dhtInvite.start)();
        if (err2) return console.error(err2.message || err2);
        return;
      }

      if (req.type === 'conn.connect') {
        const addr = req.address;
        const data = req.hubData || {};

        // connect
        ssb.connUtils.persistentConnect(addr, data, (err: any, val: any) => {
          if (err) return console.error(err.message || err);
          if (!val) return console.error(`connecting to ${addr} failed`);
          // TODO show this error as a Toast
        });
        return;
      }

      if (req.type === 'conn.rememberConnect') {
        const addr = req.address;
        const data = req.data || {};

        // remember
        const [e1] = await runAsync(ssb.conn.remember)(addr, data);
        if (e1) return console.error(e1.message || e1);

        // connect
        const [e2, result] = await runAsync(ssb.connUtils.persistentConnect)(
          addr,
          data,
        );
        if (e2) return console.error(e2.message || e2);
        if (!result) return console.error(`connecting to ${addr} failed`);
        // TODO show this error as a Toast
        return;
      }

      if (req.type === 'conn.followConnect') {
        const addr = req.address;
        const data = req.hubData || {};

        // connect
        const [e1, result] = await runAsync(ssb.connUtils.persistentConnect)(
          addr,
          data,
        );
        if (e1) return console.error(e1.message || e1);
        if (!result) return console.error(`connecting to ${addr} failed`);
        // TODO show this error as a Toast

        // check if following
        const friendId = req.key || '@' + addr.split('shs:')[1] + '.ed25519';
        const opts = {source: ssb.id, dest: friendId};
        const [e2, alreadyFollow] = await runAsync<boolean>(
          ssb.friends.isFollowing,
        )(opts);
        if (e2) return console.error(e2.message || e2);
        if (alreadyFollow) return;

        // follow
        const content = {type: 'contact', contact: friendId, following: true};
        const [e3] = await runAsync(ssb.feedUtils.publish)(content);
        if (e3) return console.error(e3.message || e3);
        return;
      }

      if (req.type === 'conn.disconnect') {
        ssb.connUtils.persistentDisconnect(req.address, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'conn.disconnectForget') {
        const addr = req.address;

        // forget
        const [e1] = await runAsync(ssb.conn.forget)(addr);
        if (e1) return console.error(e1.message || e1);

        // disconnect
        const [e2] = await runAsync(ssb.connUtils.persistentDisconnect)(addr);
        if (e2) return console.error(e2.message || e2);
        return;
      }

      if (req.type === 'conn.forget') {
        const addr = req.address;
        const [e1] = await runAsync(ssb.conn.unstage)(addr);
        if (e1) return console.error(e1.message || e1);
        const [e2] = await runAsync(ssb.conn.forget)(addr);
        if (e2) return console.error(e2.message || e2);
        return;
      }

      if (req.type === 'bluetooth.search') {
        ssb.bluetooth.makeDeviceDiscoverable(req.interval, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'dhtInvite.accept') {
        ssb.dhtInvite.accept(req.invite, (err: any) => {
          source.acceptDhtInviteResponse$._n(err ? err.message || err : true);
        });
        return;
      }

      if (req.type === 'dhtInvite.remove') {
        ssb.dhtInvite.remove(req.invite, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }
    },
  });
}

export function ssbDriver(sink: Stream<Req>): SSBSource {
  const ssbP = makeClient();
  const source = new SSBSource(ssbP);
  consumeSink(sink, source, ssbP);
  return source;
}
