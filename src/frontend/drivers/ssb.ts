/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, MemoryStream, Listener} from 'xstream';
import {
  Msg,
  Content,
  FeedId,
  MsgId,
  AboutContent,
  BlobId,
  About,
} from 'ssb-typescript';
const nodejs = require('nodejs-mobile-react-native');
import {Platform} from 'react-native';
import xsFromCallback from 'xstream-from-callback';
import runAsync = require('promisify-tuple');
import xsFromPullStream from 'xstream-from-pull-stream';
import {Readable, Callback} from 'pull-stream';
import {
  MsgAndExtras,
  PrivateThreadAndExtras,
  AnyThread,
  AboutAndExtras,
  PeerKV,
  StagedPeerKV,
  ThreadSummaryWithExtras,
} from '../ssb/types';
import makeClient, {SSBClient} from '../ssb/client';
import {imageToImageUrl} from '../ssb/utils/from-ssb';
const colorHash = new (require('color-hash'))();
const pull = require('pull-stream');
const Ref = require('ssb-ref');

export interface MentionSuggestion {
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

function dropCompletion<T>(stream: Stream<T>): Stream<T> {
  return xs.merge(stream, xs.never());
}

export type GetReadable<T> = (opts?: any) => Readable<T>;

export class SSBSource {
  private ssb$: Stream<SSBClient>;
  public selfFeedId$: MemoryStream<FeedId>;
  public publicRawFeed$: Stream<GetReadable<MsgAndExtras>>;
  public publicFeed$: Stream<GetReadable<ThreadSummaryWithExtras>>;
  public publicLiveUpdates$: Stream<null>;
  public privateFeed$: Stream<GetReadable<PrivateThreadAndExtras>>;
  public privateLiveUpdates$: Stream<MsgId>;
  public mentionsFeed$: Stream<GetReadable<MsgAndExtras>>;
  public mentionsFeedLive$: Stream<MsgId>;
  public selfPublicRoots$: Stream<ThreadSummaryWithExtras>;
  public selfPrivateRootIdsLive$: Stream<MsgId>;
  public selfReplies$: Stream<GetReadable<MsgAndExtras>>;
  public publishHook$: Stream<Msg>;
  public migrationProgress$: Stream<number>;
  public indexingProgress$: Stream<number>;
  public acceptInviteResponse$: Stream<true | string>;
  public acceptDhtInviteResponse$: Stream<true | string>;
  public consumeAliasResponse$: Stream<FeedId | false>;
  public connStarted$: Stream<void>;
  public peers$: Stream<Array<PeerKV>>;
  public stagedPeers$: Stream<Array<StagedPeerKV>>;
  public bluetoothScanState$: Stream<any>;

  constructor(ssbP: Promise<SSBClient>) {
    this.ssb$ = xs.fromPromise(ssbP).compose(dropCompletion).remember();

    this.selfFeedId$ = this.ssb$.map((ssb) => ssb.id).remember();

    this.publicRawFeed$ = this.ssb$.map((ssb) => () =>
      ssb.threadsUtils.publicRawFeed(),
    );

    this.publicFeed$ = this.ssb$.map((ssb) => (opts?: any) =>
      ssb.threadsUtils.publicFeed(opts),
    );

    this.publicLiveUpdates$ = this.fromPullStream((ssb) =>
      ssb.threadsUtils.publicUpdates(),
    ).mapTo(null);

    this.privateFeed$ = this.ssb$.map((ssb) => (opts?: any) =>
      ssb.threadsUtils.privateFeed(opts),
    );

    this.privateLiveUpdates$ = this.fromPullStream<MsgId>((ssb) =>
      ssb.threadsUtils.privateUpdates(),
    );

    this.mentionsFeed$ = this.ssb$.map((ssb) => () =>
      ssb.threadsUtils.mentionsFeed(),
    );

    this.mentionsFeedLive$ = this.fromPullStream<MsgId>((ssb) =>
      ssb.dbUtils.mentionsMe({live: true, old: false}),
    );

    this.selfPublicRoots$ = this.fromPullStream<ThreadSummaryWithExtras>(
      (ssb) => ssb.threadsUtils.selfPublicRoots({live: true, old: false}),
    );

    this.selfPrivateRootIdsLive$ = this.fromPullStream<MsgId>((ssb) =>
      ssb.dbUtils.selfPrivateRootIdsLive(),
    );

    this.selfReplies$ = this.ssb$.map((ssb) => (opts?: any) =>
      ssb.threadsUtils.selfReplies(opts),
    );

    this.publishHook$ = this.ssb$
      .map((ssb) => ssb.hooks.publishStream())
      .flatten();

    this.migrationProgress$ = this.fromPullStream<number>((ssb) =>
      ssb.syncing.migrating(),
    );

    this.indexingProgress$ = this.fromPullStream<number>((ssb) =>
      ssb.syncing.indexing(),
    );

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.acceptDhtInviteResponse$ = xs.create<true | string>();
    this.connStarted$ = xs.create<void>();
    this.consumeAliasResponse$ = xs.create<FeedId>();

    this.peers$ = this.fromPullStream<Array<PeerKV>>((ssb) =>
      ssb.connUtils.peers(),
    );

    this.stagedPeers$ = this.fromPullStream<Array<StagedPeerKV>>((ssb) =>
      ssb.connUtils.stagedPeers(),
    );

    this.bluetoothScanState$ =
      Platform.OS === 'ios' // TODO: remove this, because the backend checks too
        ? xs.empty()
        : this.fromPullStream((ssb) => ssb.bluetooth.bluetoothScanState());
  }

  private fromPullStream<T>(fn: (ssb: SSBClient) => Readable<T>): Stream<T> {
    return this.ssb$.map(fn).map(xsFromPullStream).flatten() as Stream<T>;
  }

  private fromCallback<T>(
    fn: (ssb: SSBClient, cb: Callback<T>) => void,
  ): Stream<T> {
    return this.ssb$.map(xsFromCallback<T>(fn)).flatten();
  }

  public thread$(rootMsgId: MsgId, privately: boolean): Stream<AnyThread> {
    return this.fromCallback<AnyThread>((ssb, cb) =>
      ssb.threadsUtils.thread({root: rootMsgId, private: privately}, cb),
    );
  }

  public threadUpdates$(
    rootMsgId: MsgId,
    privately: boolean,
  ): Stream<MsgAndExtras> {
    return this.fromPullStream<MsgAndExtras>((ssb) =>
      ssb.threadsUtils.threadUpdates({root: rootMsgId, private: privately}),
    );
  }

  public rehydrateMessage$(msg: MsgAndExtras): Stream<MsgAndExtras> {
    return this.fromCallback<MsgAndExtras>((ssb, cb) =>
      ssb.threadsUtils.rehydrateLiveExtras(msg, cb),
    );
  }

  public profileFeed$(
    id: FeedId,
  ): Stream<GetReadable<ThreadSummaryWithExtras>> {
    return this.ssb$.map((ssb) => (opts?: any) =>
      ssb.threadsUtils.profileFeed(id, opts),
    );
  }

  public liteAboutReadable$(
    ids: Array<FeedId>,
  ): Stream<GetReadable<About> | null> {
    return this.ssb$.map((ssb) => () => {
      if (!ids || !ids.length) {
        return null;
      }

      return pull(
        pull.values(ids),
        pull.asyncMap((id: FeedId, cb: Callback<About>) => {
          ssb.cachedAboutSelf.get(id, (err: any, output: any) => {
            if (err) {
              cb(err);
              return;
            }
            const name = output.name;
            const imageUrl = imageToImageUrl(output.image);
            cb(null, {name, imageUrl, id});
          });
        }),
      );
    });
  }

  public profileEdges$(
    start: FeedId,
    reverse: boolean,
    positive: boolean,
  ): Stream<Array<FeedId>> {
    return this.ssb$
      .map(async (ssb) => {
        const [err, out] = await runAsync<any>(ssb.friends.hops)({
          start,
          reverse,
          max: 1,
        });

        if (err) {
          console.error(err);
          return [];
        }

        const hops: Record<FeedId, number> = out;
        return Object.keys(hops).filter((feedId) =>
          positive ? hops[feedId] > 0 : hops[feedId] < 0,
        );
      })
      .map((promise) => xs.fromPromise(promise))
      .flatten();
  }

  public profileImage$(id: FeedId): Stream<string | undefined> {
    return this.ssb$
      .map((ssb) =>
        xsFromCallback<{image?: string}>(ssb.cachedAboutSelf.get)(id),
      )
      .flatten()
      .map((output) => imageToImageUrl(output.image));
  }

  public profileAboutLive$(id: FeedId): Stream<AboutAndExtras> {
    return this.ssb$
      .map((ssb) => {
        const selfId = ssb.id;
        const color = colorHash.hex(id);
        const aboutBasics$ = xsFromPullStream(ssb.aboutSelf.stream(id))
          .map(
            (profile: {
              name?: string;
              image?: string;
              description?: string;
            }) => {
              if (profile.image) profile.image = imageToImageUrl(profile.image);
              return profile;
            },
          )
          .startWith({});
        const following$ =
          selfId === id ? xs.of(null) : ssb.contacts.tristate(selfId, id);
        const followsYou$ =
          selfId === id ? xs.of(null) : ssb.contacts.tristate(id, selfId);
        return xs.combine(aboutBasics$, following$, followsYou$).map(
          ([aboutBasics, following, followsYou]) =>
            ({
              id,
              name: aboutBasics.name,
              color,
              imageUrl: aboutBasics.image,
              description: aboutBasics.description,
              following,
              followsYou,
            } as AboutAndExtras),
        );
      })
      .flatten();
  }

  public consumeAlias$(uri: string): Stream<FeedId> {
    return this.fromCallback<any>((ssb, cb) =>
      ssb.roomClient.consumeAliasUri(uri, cb),
    ).map((rpc) => rpc.id);
  }

  public getAliasesLive$(id: FeedId): Stream<Array<Alias>> {
    return this.fromPullStream<Array<Alias>>((ssb) =>
      ssb.aliasUtils.stream(id),
    );
  }

  public addBlobFromPath$(path: string): Stream<BlobId> {
    return this.fromCallback<BlobId>((ssb, cb) =>
      ssb.blobsUtils.addFromPath(path, cb),
    );
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
    return this.fromPullStream<boolean>((ssb) =>
      ssb.friendsUtils.isPrivatelyBlockingStream(dest),
    );
  }

  public createDhtInvite$(): Stream<string> {
    return this.fromCallback<string>((ssb, cb) => ssb.dhtInvite.create(cb));
  }

  public getMentionSuggestions(text: string | null, authors: Array<FeedId>) {
    const opts: Record<string, any> = {limit: 10};
    if (!!text) opts.text = text;
    if (authors.length) opts.defaultIds = authors;
    return this.ssb$
      .map((ssb) =>
        xsFromCallback<Array<MentionSuggestion>>(ssb.suggest.profile)(opts).map(
          (arr) =>
            arr
              .filter((suggestion) => suggestion.id !== ssb.id)
              .map((suggestion) => ({
                ...suggestion,
                imageUrl: imageToImageUrl(suggestion.image),
              })),
        ),
      )
      .flatten();
  }

  public getMnemonic$(): Stream<string> {
    return this.fromCallback<string>((ssb, cb) =>
      ssb.keysUtils.getMnemonic(cb),
    );
  }

  public readSettings(): Stream<{
    hops?: number;
    blobsStorageLimit?: number;
    detailedLogs?: boolean;
    showFollows?: boolean;
  }> {
    return this.fromCallback<any>((ssb, cb) => ssb.settingsUtils.read(cb));
  }
}

export interface CreateIdentityReq {
  type: 'identity.create';
}

export interface UseIdentityReq {
  type: 'identity.use';
}

export interface PublishReq {
  type: 'publish';
  content: NonNullable<Content>;
}

export interface PublishAboutReq {
  type: 'publishAbout';
  content: AboutContent;
}

export interface AcceptInviteReq {
  type: 'invite.accept';
  invite: string;
}

export interface AcceptDhtInviteReq {
  type: 'dhtInvite.accept';
  invite: string;
}

export interface RemoveDhtInviteReq {
  type: 'dhtInvite.remove';
  invite: string;
}

export interface SearchBluetoothReq {
  type: 'bluetooth.search';
  interval: number;
}

export interface ConnStartReq {
  type: 'conn.start';
}

export interface ConnConnectReq {
  type: 'conn.connect';
  address: string;
  hubData?: any;
}

export interface ConnRememberConnectReq {
  type: 'conn.rememberConnect';
  address: string;
  data?: any;
}

export interface ConnFollowConnectReq {
  type: 'conn.followConnect';
  address: string;
  key?: string;
  hubData?: any;
}

export interface ConnDisconnectReq {
  type: 'conn.disconnect';
  address: string;
}

export interface ConnDisconnectForgetReq {
  type: 'conn.disconnectForget';
  address: string;
}

export interface ConnForgetReq {
  type: 'conn.forget';
  address: string;
}

export interface RoomConsumeInviteUri {
  type: 'httpInviteClient.claim';
  uri: string;
}

export interface RoomSignInUri {
  type: 'httpAuthClient.signIn';
  uri: string;
}

export interface RoomConsumeAliasUri {
  type: 'roomClient.consumeAliasUri';
  uri: string;
}

export interface SettingsHopsReq {
  type: 'settings.hops';
  hops: number;
}

export interface SettingsBlobsPurgeReq {
  type: 'settings.blobsPurge';
  storageLimit: number;
}

export interface SettingsShowFollowsReq {
  type: 'settings.showFollows';
  showFollows: boolean;
}

export interface SettingsDetailedLogsReq {
  type: 'settings.detailedLogs';
  detailedLogs: boolean;
}

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
  | ConnForgetReq
  | RoomConsumeInviteUri
  | RoomSignInUri
  | RoomConsumeAliasUri
  | SettingsHopsReq
  | SettingsBlobsPurgeReq
  | SettingsShowFollowsReq
  | SettingsDetailedLogsReq;

export function contentToPublishReq(content: NonNullable<Content>): PublishReq {
  return {type: 'publish', content};
}

async function consumeSink(
  sink: Stream<Req>,
  source: SSBSource,
  ssbP: Promise<SSBClient>,
) {
  let identityAvailable = false;

  sink.addListener({
    next: async (req) => {
      if (req.type === 'identity.create' && !identityAvailable) {
        nodejs.channel.post('identity', 'CREATE');
        identityAvailable = true;
        return;
      }

      if (req.type === 'identity.use' && !identityAvailable) {
        nodejs.channel.post('identity', 'USE');
        identityAvailable = true;
        return;
      }

      const ssb = await ssbP;

      if (req.type === 'publish') {
        ssb.publishUtils.publish(req.content);
        return;
      }

      if (req.type === 'publishAbout') {
        ssb.publishUtils.publishAbout(req.content, () => {
          ssb.cachedAboutSelf.invalidate(ssb.id);
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

        const [err3] = await runAsync(ssb.suggest.start)();
        if (err3) return console.error(err3.message || err3);

        source.connStarted$._n(void 0);

        // TODO: make a settings plugin in the backend, when it inits it
        // should call ssb.blobsPurge.start if we loaded the amount from fs

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

      if (req.type === 'httpInviteClient.claim') {
        const res = await runAsync(ssb.httpInviteClient.claim)(req.uri);
        const [e1, msaddr] = res;
        if (e1) {
          source.acceptInviteResponse$._n(`connecting to ${msaddr} failed`);
          return;
        }

        source.acceptInviteResponse$._n(true);

        const key = Ref.getKeyFromAddress(msaddr);
        const [e2] = await runAsync(ssb.conn.remember)(msaddr, {
          key,
          // TODO: these should be put in ssb-room-client when
          // the room answers `room.metadata` or `tunnel.isRoom`:
          // type: 'room',
          // supportsHttpAuth: true,
          // supportsAliases: true,
        });
        if (e2) {
          console.error(e2.message || e2);
          console.error(`conn.remembering ${msaddr} failed`);
          return;
        }

        return;
      }

      if (req.type === 'roomClient.consumeAliasUri') {
        ssb.roomClient.consumeAliasUri(req.uri, (err: any, rpc: any) => {
          if (err) {
            console.error('error to consume alias');
            console.error(err);
            source.consumeAliasResponse$._n(false);
          } else {
            source.consumeAliasResponse$._n(rpc.id);
          }
        });
        return;
      }

      if (req.type === 'httpAuthClient.signIn') {
        ssb.httpAuthClient.consumeSignInSsbUri(
          req.uri,
          (err: any, _res: boolean) => {
            if (err) {
              console.error('error to sign-in');
              console.error(err);
            }
          },
        );
        return;
      }

      if (req.type === 'settings.hops') {
        ssb.settingsUtils.updateHops(req.hops, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'settings.blobsPurge') {
        ssb.settingsUtils.updateBlobsPurge(req.storageLimit, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'settings.showFollows') {
        ssb.threadsUtils.updateShowFollows(req.showFollows);
        ssb.settingsUtils.updateShowFollows(req.showFollows, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'settings.detailedLogs') {
        ssb.settingsUtils.updateDetailedLogs(req.detailedLogs, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }
    },
  });
}

function waitForIdentity() {
  return new Promise<boolean>((resolve) => {
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
