/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, MemoryStream, Listener} from 'xstream';
import backoff from 'xstream-backoff';
import {
  Msg,
  Content,
  FeedId,
  MsgId,
  AboutContent,
  BlobId,
} from 'ssb-typescript';
const nodejs = require('nodejs-mobile-react-native');
import {Platform} from 'react-native';
import {
  isMsg,
  isRootPostMsg,
  isReplyPostMsg,
  isPublic,
} from 'ssb-typescript/utils';
import {Thread as ThreadData} from 'ssb-threads/types';
import xsFromCallback from 'xstream-from-callback';
import runAsync = require('promisify-tuple');
import xsFromPullStream from 'xstream-from-pull-stream';
import {Readable, Callback} from 'pull-stream';
import {
  MsgAndExtras,
  PrivateThreadAndExtras,
  ThreadAndExtras,
  AnyThread,
  AboutAndExtras,
  PeerKV,
  StagedPeerKV,
} from '../../shared-types';
import makeClient from '../ssb/client';
import {imageToImageUrl} from '../ssb/utils/from-ssb';
const colorHash = new (require('color-hash'))();

export type MentionSuggestion = {
  id: FeedId;
  name: string;
  image: any;
  following: boolean;
};

export type RestoreIdentityResponse =
  | 'OVERWRITE_RISK'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'WRONG_LENGTH'
  | 'INCORRECT'
  | 'IDENTITY_READY';

function mutateMsgWithLiveExtras(ssb: any) {
  const getAbout = ssb.cachedAbout.socialValue;
  return async (msg: Msg, cb: Callback<MsgAndExtras>) => {
    if (!isMsg(msg) || !msg.value) return cb(null, msg as any);

    // Fetch name
    const nameOpts = {key: 'name', dest: msg.value.author};
    const [e1, name] = await runAsync<string | undefined>(getAbout)(nameOpts);
    if (e1) return cb(e1);

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
    const [e3, destName] = await runAsync<string | undefined>(getAbout)(dOpts);
    if (e3) return cb(e3);
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

function getRecipient(recp: string | Record<string, any>): string | undefined {
  if (typeof recp === 'object' && Ref.isFeed(recp.link)) {
    return recp.link;
  }
  if (typeof recp === 'string' && Ref.isFeed(recp)) {
    return recp;
  }
}

function mutatePrivateThreadWithLiveExtras(ssb: any) {
  const getAbout = ssb.cachedAbout.socialValue;
  return async (thread: ThreadData, cb: Callback<PrivateThreadAndExtras>) => {
    for (const msg of thread.messages) {
      await runAsync(mutateMsgWithLiveExtras(ssb))(msg);
    }
    const root: Msg<Content> | undefined = thread.messages[0];
    const pvthread: PrivateThreadAndExtras = thread as any;
    if (root && root?.value?.content?.recps) {
      pvthread.recps = [];
      for (const recp of root?.value?.content?.recps) {
        const id = getRecipient(recp);
        if (!id) continue;

        // Fetch name
        const nameOpts = {key: 'name', dest: id};
        const [e1, name] = await runAsync<string | undefined>(getAbout)(
          nameOpts,
        );
        if (e1) return cb(e1);

        // Fetch avatar
        const avatarOpts = {key: 'image', dest: id};
        const [e2, val] = await runAsync<string>(getAbout)(avatarOpts);
        if (e2) return cb(e2);
        const imageUrl = imageToImageUrl(val);

        // Push
        pvthread.recps.push({id, name, imageUrl});
      }
    }
    cb(null, pvthread as PrivateThreadAndExtras);
  };
}

function augmentPeerWithExtras(ssb: any) {
  const getAbout = ssb.cachedAbout.socialValue;
  return async ([addr, peer]: PeerKV, cb: Callback<[string, any]>) => {
    // Fetch name
    const nameOpts = {key: 'name', dest: peer.key};
    const [e1, name] = await runAsync<string | undefined>(getAbout)(nameOpts);
    if (e1) return cb(e1);

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
  public privateFeed$: Stream<GetReadable<PrivateThreadAndExtras>>;
  public privateLiveUpdates$: Stream<MsgId>;
  public isSyncing$: Stream<boolean>;
  public selfPublicRoots$: Stream<GetReadable<ThreadAndExtras>>;
  public selfPrivateRoots$: Stream<Msg>;
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

    // TODO put in the backend
    this.publicRawFeed$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.createFeedStream({reverse: true, live: false, ...opts}),
        pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
      ),
    );

    // TODO put in the backend
    this.publicFeed$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.threads.public({
          threadMaxSize: 3,
          allowlist: ['post', 'contact'],
          ...opts,
        }),
        pull.asyncMap(mutateThreadWithLiveExtras(ssb)),
      ),
    );

    this.publicLiveUpdates$ = this.getStream(ssb =>
      ssb.threads.publicUpdates({allowlist: ['post', 'contact']}),
    ).mapTo(null);

    // TODO put in the backend
    this.privateFeed$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.threads.private({threadMaxSize: 1, allowlist: ['post'], ...opts}),
        pull.asyncMap(mutatePrivateThreadWithLiveExtras(ssb)),
      ),
    );

    this.privateLiveUpdates$ = this.getStream<MsgId>(ssb =>
      ssb.threads.privateUpdates({allowlist: ['post'], includeSelf: true}),
    );

    this.isSyncing$ = this.getStream(ssb => ssb.syncing.stream()).map(
      (resp: any) => resp.started > 0,
    );

    // TODO put in the backend
    this.selfPublicRoots$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.createUserStream({id: ssb.id, ...opts}),
        pull.filter(isRootPostMsg),
        pull.filter(isPublic),
        pull.map((msg: Msg) => ({messages: [msg], full: true} as ThreadData)),
        pull.asyncMap(mutateThreadWithLiveExtras(ssb)),
      ),
    );

    // TODO put in the backend
    this.selfPrivateRoots$ = this.getStream<Msg>(ssb =>
      pull(
        ssb.threads.private({
          threadMaxSize: 1,
          allowlist: ['post'],
          old: false,
          live: true,
        }),
        pull.map((thread: ThreadData) => thread?.messages?.[0]),
        pull.filter((msg: Msg) => msg?.value?.author === ssb.id),
      ),
    );

    // TODO put in the backend
    this.selfReplies$ = this.ssb$.map(ssb => (opts?: any) =>
      pull(
        ssb.createUserStream({id: ssb.id, ...opts}),
        pull.filter(isReplyPostMsg),
        pull.filter(isPublic),
        pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
      ),
    );

    this.publishHook$ = this.ssb$
      .map(ssb => ssb.hooks.publishStream())
      .flatten();

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.acceptDhtInviteResponse$ = xs.create<true | string>();

    // TODO put in the backend
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

    // TODO put in the backend
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

    this.bluetoothScanState$ =
      Platform.OS === 'ios'
        ? xs.empty()
        : this.getStream(ssb => ssb.bluetooth.bluetoothScanState());
  }

  private getStream<T>(fn: (ssb: any) => any): Stream<T> {
    return this.ssb$
      .map(fn)
      .map(xsFromPullStream)
      .flatten() as Stream<T>;
  }

  // TODO put in the backend
  public thread$(rootMsgId: MsgId, privately: boolean): Stream<AnyThread> {
    const ssbToThread = (ssb: any, cb: any) => {
      pull(
        ssb.threads.thread({root: rootMsgId, private: privately}),
        pull.asyncMap((t: ThreadData, cb2: Callback<AnyThread>) => {
          if (privately) {
            mutatePrivateThreadWithLiveExtras(ssb)(t, cb2);
          } else {
            mutateThreadWithLiveExtras(ssb)(t, cb2);
          }
        }),
        pull.take(1),
        pull.drain(
          (thread: AnyThread) => cb(null, thread),
          (err: any) => (err ? cb(err) : void 0),
        ),
      );
    };
    const toThread$ = xsFromCallback<AnyThread>(ssbToThread);
    return this.ssb$.map(toThread$).flatten();
  }

  // TODO put in the backend
  public threadUpdates$(
    rootMsgId: MsgId,
    privately: boolean,
  ): Stream<MsgAndExtras> {
    return this.ssb$
      .map(ssb =>
        pull(
          ssb.threads.threadUpdates({root: rootMsgId, private: privately}),
          pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
        ),
      )
      .map<Stream<MsgAndExtras>>(xsFromPullStream)
      .flatten();
  }

  // TODO put in the backend
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
          const [, name] = await runAsync<string | undefined>(getAbout)({
            key: 'name',
            dest: id,
          });

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

  public restoreIdentity$(inputWords: string): Stream<RestoreIdentityResponse> {
    return xs.create<RestoreIdentityResponse>({
      start(listener: Listener<RestoreIdentityResponse>) {
        this.fn = (msg: RestoreIdentityResponse) => listener.next(msg);
        nodejs.channel.addListener('identity', this.fn);
        nodejs.channel.post('identity', `RESTORE: ${inputWords}`);
      },
      stop() {
        nodejs.channel.removeListener('identity', this.fn);
      },
    });
  }

  public isPrivatelyBlocking$(dest: FeedId): Stream<boolean> {
    return this.getStream<boolean>(ssb =>
      ssb.friendsUtils.isPrivatelyBlockingStream(dest),
    );
  }

  public createDhtInvite$(): Stream<string> {
    return this.ssb$
      .map(ssb => xsFromCallback<string>(ssb.dhtInvite.create)())
      .flatten();
  }

  public getMentionSuggestions(text: string | null, authors: Array<FeedId>) {
    const opts: Record<string, any> = {limit: 10};
    if (!!text) opts.text = text;
    if (authors.length) opts.defaultIds = authors;
    return this.ssb$
      .map(ssb =>
        xsFromCallback<Array<MentionSuggestion>>(ssb.suggest.profile)(opts).map(
          arr =>
            arr
              .filter(suggestion => suggestion.id !== ssb.id)
              .map(suggestion => ({
                ...suggestion,
                imageUrl: imageToImageUrl(suggestion.image),
              })),
        ),
      )
      .flatten();
  }

  public getMnemonic$(): Stream<string> {
    return this.ssb$
      .map(ssb => xsFromCallback<string>(ssb.keysUtils.getMnemonic)())
      .flatten();
  }
}

export type CreateIdentityReq = {
  type: 'identity.create';
};

export type UseIdentityReq = {
  type: 'identity.use';
};

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
  | CreateIdentityReq
  | UseIdentityReq
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
  sink
    .filter(r => r.type === 'identity.create' || r.type === 'identity.use')
    .take(1)
    .addListener({
      next(r) {
        if (r.type === 'identity.create') {
          nodejs.channel.post('identity', 'CREATE');
        }
        if (r.type === 'identity.use') {
          nodejs.channel.post('identity', 'USE');
        }
      },
    });

  const ssb = await ssbP;

  sink.addListener({
    next: async req => {
      if (req.type === 'publish') {
        ssb.publishUtils.publish(req.content);
        return;
      }

      if (req.type === 'publishAbout') {
        ssb.publishUtils.publishAbout(req.content, () => {
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
        const isRoomInvite = data.type === 'room';

        // remember
        const [e1] = await runAsync(ssb.conn.remember)(addr, data);
        if (e1) {
          console.error(e1.message || e1);
          console.error(`conn.remembering ${addr} failed`);
          if (isRoomInvite) {
            source.acceptInviteResponse$._n(`connecting to ${addr} failed`);
          }
          return;
        }

        // connect
        const [e2] = await runAsync(ssb.connUtils.persistentConnect)(
          addr,
          data,
        );
        if (e2) {
          console.error(e2.message || e2);
          console.error(`connecting to ${addr} failed`);
          if (isRoomInvite) {
            source.acceptInviteResponse$._n(`connecting to ${addr} failed`);
          }
          return;
        }

        if (isRoomInvite) source.acceptInviteResponse$._n(true);
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
        const [e3] = await runAsync(ssb.publishUtils.publish)(content);
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
        if (Platform.OS !== 'ios') {
          ssb.bluetooth.makeDeviceDiscoverable(req.interval, (err: any) => {
            if (err) return console.error(err.message || err);
          });
        }
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

function waitForIdentity() {
  return new Promise<boolean>(resolve => {
    nodejs.channel.addListener('identity', (msg: RestoreIdentityResponse) => {
      if (msg === 'IDENTITY_READY') resolve(true);
    });
  });
}

export function ssbDriver(sink: Stream<Req>): SSBSource {
  const ssbP = waitForIdentity().then(makeClient);
  const source = new SSBSource(ssbP);
  consumeSink(sink, source, ssbP);
  return source;
}
