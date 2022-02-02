// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, MemoryStream, Listener} from 'xstream';
import {
  Msg,
  Content,
  FeedId,
  MsgId,
  AboutContent,
  BlobId,
  About,
  AliasContent,
  PostContent,
} from 'ssb-typescript';
import backend from './backend';
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
  Alias,
  FirewallAttempt,
  SSBFriendsQueryDetails,
} from '../../ssb/types';
import makeClient, {SSBClient} from '../../ssb/client';
import {imageToImageUrl} from '../../ssb/utils/from-ssb';
import dropRepeats from 'xstream/extra/dropRepeats';
const URLPolyfill =
  Platform.OS !== 'web' ? require('react-native-url-polyfill').URL : URL;
const pull = require('pull-stream');
const Ref = require('ssb-ref');

export interface MentionSuggestion {
  id: FeedId;
  name: string;
  image: any;
  following: boolean;
}

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
  public privateFeed$: Stream<GetReadable<PrivateThreadAndExtras<PostContent>>>;
  public privateLiveUpdates$: Stream<MsgId>;
  public preferredReactions$: Stream<Array<string>>;
  public mentionsFeed$: Stream<GetReadable<MsgAndExtras>>;
  public mentionsFeedLive$: Stream<MsgId>;
  public firewallAttempt$: Stream<GetReadable<FirewallAttempt>>;
  public firewallAttemptLive$: Stream<FirewallAttempt>;
  public selfPublicRoots$: Stream<ThreadSummaryWithExtras>;
  public selfPrivateRootIdsLive$: Stream<MsgId>;
  public selfRepliesLive$: Stream<MsgAndExtras<PostContent>>;
  public publishHook$: Stream<Msg>;
  public migrationProgress$: Stream<number>;
  public indexingProgress$: Stream<number>;
  public acceptInviteResponse$: Stream<true | string>;
  public consumeAliasResponse$: Stream<FeedId | false>;
  public connStarted$: Stream<void>;
  public peers$: Stream<Array<PeerKV>>;
  public stagedPeers$: Stream<Array<StagedPeerKV>>;
  public bluetoothScanState$: Stream<any>;

  constructor(ssbP: Promise<SSBClient>) {
    this.ssb$ = xs.fromPromise(ssbP).compose(dropCompletion).remember();

    this.selfFeedId$ = this.ssb$.map((ssb) => ssb.id).remember();

    this.publicRawFeed$ = this.ssb$.map(
      (ssb) => () => ssb.threadsUtils.publicRawFeed(),
    );

    this.publicFeed$ = this.ssb$.map(
      (ssb) => (opts?: any) => ssb.threadsUtils.publicFeed(opts),
    );

    this.publicLiveUpdates$ = this.fromPullStream((ssb) =>
      ssb.threadsUtils.publicUpdates(),
    ).mapTo(null);

    this.privateFeed$ = this.ssb$.map(
      (ssb) => (opts?: any) => ssb.threadsUtils.privateFeed(opts),
    );

    this.privateLiveUpdates$ = this.fromPullStream<MsgId>((ssb) =>
      ssb.threadsUtils.privateUpdates(),
    );

    this.preferredReactions$ = this.fromPullStream<Array<string>>((ssb) =>
      ssb.dbUtils.preferredReactions(),
    )
      .compose(
        dropRepeats((before, after) => before.join('#') === after.join('#')),
      )
      .remember();

    this.mentionsFeed$ = this.ssb$.map(
      (ssb) => () => ssb.threadsUtils.mentionsFeed(),
    );

    this.mentionsFeedLive$ = this.fromPullStream<MsgId>((ssb) =>
      ssb.dbUtils.mentionsMe({live: true, old: false}),
    );

    this.firewallAttempt$ = this.ssb$.map(
      (ssb) => () => ssb.connFirewall.attempts({old: true, live: false}),
    );

    this.firewallAttemptLive$ = this.fromPullStream<FirewallAttempt>((ssb) =>
      ssb.connFirewall.attempts({old: false, live: true}),
    );

    this.selfPublicRoots$ = this.fromPullStream<ThreadSummaryWithExtras>(
      (ssb) => ssb.threadsUtils.selfPublicRoots({live: true, old: false}),
    );

    this.selfPrivateRootIdsLive$ = this.fromPullStream<MsgId>((ssb) =>
      ssb.dbUtils.selfPrivateRootIdsLive(),
    );

    this.selfRepliesLive$ = this.fromPullStream<MsgAndExtras<PostContent>>(
      (ssb) => ssb.threadsUtils.selfReplies({live: true, old: false}),
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
    this.connStarted$ = xs.create<void>();
    this.consumeAliasResponse$ = xs.create<FeedId>();

    this.peers$ = this.fromPullStream<Array<PeerKV>>((ssb) =>
      ssb.connUtils.peers(),
    ).remember();

    this.stagedPeers$ = this.fromPullStream<Array<StagedPeerKV>>((ssb) =>
      ssb.connUtils.stagedPeers(),
    ).remember();

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
    return this.ssb$.map(
      (ssb) => (opts?: any) => ssb.threadsUtils.profileFeed(id, opts),
    );
  }

  public postsCount$() {
    return this.fromCallback<number>((ssb, cb) => ssb.dbUtils.postsCount(cb));
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

  public profileAbout$(id: FeedId): Stream<AboutAndExtras> {
    return this.ssb$
      .map((ssb) =>
        xsFromCallback<{image?: string; name?: string}>(
          ssb.cachedAboutSelf.get,
        )(id),
      )
      .flatten()
      .map((output) => ({
        id,
        name: output.name,
        imageUrl: imageToImageUrl(output.image),
      }));
  }

  public profileAboutLive$(id: FeedId): Stream<AboutAndExtras> {
    return this.fromPullStream<{
      name?: string;
      image?: string;
      description?: string;
    }>((ssb) => ssb.aboutSelf.stream(id)).map(
      (profile) =>
        ({
          id,
          name: profile.name,
          imageUrl: imageToImageUrl(profile.image),
          description: profile.description,
        } as AboutAndExtras),
    );
  }

  public isFollowing$(
    source: FeedId,
    dest: FeedId,
  ): Stream<SSBFriendsQueryDetails> {
    return this.fromCallback<SSBFriendsQueryDetails>((ssb, cb) =>
      ssb.friends.isFollowing({source, dest, details: true}, cb),
    );
  }

  public isBlocking$(
    source: FeedId,
    dest: FeedId,
  ): Stream<SSBFriendsQueryDetails> {
    return this.fromCallback<SSBFriendsQueryDetails>((ssb, cb) =>
      ssb.friends.isBlocking({source, dest, details: true}, cb),
    );
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

  public aliasRegistrationRooms$(): Stream<Array<PeerKV>> {
    return this.fromCallback<Array<PeerKV>>((ssb, cb) =>
      ssb.conn.dbPeers(cb),
    ).map((peers) =>
      peers
        .filter(
          ([_addr, data]) =>
            data.type === 'room' &&
            data.name &&
            data.supportsAliases &&
            data.membership,
        )
        .map((peer) => {
          const [addr, data] = peer;
          if (data.key) {
            return peer;
          } else {
            return [addr, {...data, key: Ref.getKeyFromAddress(addr)}];
          }
        }),
    );
  }

  public registerAlias$(roomId: FeedId, alias: string): Stream<string> {
    return this.fromCallback<string>((ssb, cb) =>
      ssb.roomClient.registerAlias(roomId, alias, (err: any, res: string) => {
        if (err) {
          cb(err);
          return;
        }

        const content: AliasContent = {
          type: 'room/alias',
          action: 'registered',
          alias,
          room: roomId,
        };
        if (res && typeof res === 'string') {
          content.aliasURL = res;
        }
        ssb.publishUtils.publish(content);
        cb(null, res);
      }),
    );
  }

  public revokeAlias$(roomId: FeedId, alias: string): Stream<true> {
    return this.fromCallback<true>((ssb, cb) =>
      ssb.roomClient.revokeAlias(roomId, alias, (err: any, res: true) => {
        if (err) {
          cb(err);
          return;
        }

        const content: AliasContent = {
          type: 'room/alias',
          action: 'revoked',
          alias,
          room: roomId,
        };
        ssb.publishUtils.publish(content);
        cb(null, res);
      }),
    );
  }

  public addBlobFromPath$(path: string): Stream<BlobId> {
    return this.fromCallback<BlobId>((ssb, cb) =>
      ssb.blobsUtils.addFromPath(path, cb),
    );
  }

  public deleteBlob$(blobId: BlobId): Stream<null> {
    return this.fromCallback<null>((ssb, cb) => ssb.blobs.rm(blobId, cb));
  }

  public restoreIdentity$(inputWords: string): Stream<RestoreIdentityResponse> {
    return xs.create<RestoreIdentityResponse>({
      start(listener: Listener<RestoreIdentityResponse>) {
        this.fn = (msg: RestoreIdentityResponse) => listener.next(msg);
        backend.addListener('identity', this.fn);
        backend.post('identity', `RESTORE: ${inputWords}`);
      },
      stop() {
        backend.removeListener('identity', this.fn);
      },
    });
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

  public searchPublicPosts$(
    text: string,
  ): Stream<GetReadable<MsgAndExtras<PostContent>>> {
    return this.ssb$.map(
      (ssb) => () => ssb.threadsUtils.searchPublicPosts(text),
    );
  }

  public searchPublishHashtagSummaries$(
    text: string,
  ): Stream<GetReadable<ThreadSummaryWithExtras>> {
    return this.ssb$.map((ssb) => () => ssb.threadsUtils.hashtagFeed(text));
  }

  public produceSignInWebUrl$(serverId: FeedId): Stream<string> {
    return this.fromCallback<string>((ssb, cb) =>
      ssb.httpAuthClient.produceSignInWebUrl(serverId, cb),
    );
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
    allowCheckingNewVersion?: boolean;
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

export interface MigrateIdentityReq {
  type: 'identity.migrate';
}

export interface PublishReq {
  type: 'publish';
  content: NonNullable<Content | AliasContent>;
}

export interface PublishAboutReq {
  type: 'publishAbout';
  content: AboutContent;
}

export interface AcceptInviteReq {
  type: 'invite.accept';
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

export interface SettingsAllowCheckingNewVersionReq {
  type: 'settings.allowCheckingNewVersion';
  allowCheckingNewVersion: boolean;
}

export type Req =
  | CreateIdentityReq
  | UseIdentityReq
  | MigrateIdentityReq
  | PublishReq
  | PublishAboutReq
  | AcceptInviteReq
  | SearchBluetoothReq
  | ConnStartReq
  | ConnConnectReq
  | ConnRememberConnectReq
  | ConnDisconnectReq
  | ConnDisconnectForgetReq
  | ConnForgetReq
  | RoomConsumeInviteUri
  | RoomSignInUri
  | RoomConsumeAliasUri
  | SettingsHopsReq
  | SettingsBlobsPurgeReq
  | SettingsShowFollowsReq
  | SettingsDetailedLogsReq
  | SettingsAllowCheckingNewVersionReq;

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
        backend.post('identity', 'CREATE');
        identityAvailable = true;
        return;
      }

      if (req.type === 'identity.use' && !identityAvailable) {
        backend.post('identity', 'USE');
        identityAvailable = true;
        return;
      }

      if (req.type === 'identity.migrate' && !identityAvailable) {
        backend.post('identity', 'MIGRATE');
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

      if (req.type === 'httpInviteClient.claim') {
        const res = await runAsync(ssb.httpInviteClient.claim)(req.uri);
        const [e1, msaddr] = res;
        if (e1) {
          source.acceptInviteResponse$._n(`room rejected invite claim`);
          return;
        }

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

        const [e3] = await runAsync(ssb.connUtils.persistentConnect)(msaddr, {
          key,
        });
        if (e3) {
          console.error(e3.message || e2);
          console.error(`connecting to ${msaddr} failed`);
          source.acceptInviteResponse$._n(`connecting to ${msaddr} failed`);
          return;
        }

        source.acceptInviteResponse$._n(true);
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
        // sign-in
        const [e1] = await runAsync(ssb.httpAuthClient.consumeSignInSsbUri)(
          req.uri,
        );
        if (e1) {
          console.error('error to sign-in');
          console.error(e1.message || e1);
          return;
        }

        const u = new URLPolyfill(req.uri);
        const addr: string = u.searchParams.get('multiserverAddress')!;

        // remember
        const data = {type: 'room'};
        const [e2] = await runAsync(ssb.conn.remember)(addr, data);
        if (e2) {
          console.error(`conn.remembering ${addr} failed`);
          console.error(e2.message || e2);
          return;
        }

        // connect
        const [e3] = await runAsync(ssb.connUtils.persistentConnect)(
          addr,
          data,
        );
        if (e3) {
          console.error(`connecting to ${addr} failed`);
          console.error(e3.message || e3);
          return;
        }
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

      if (req.type === 'settings.allowCheckingNewVersion') {
        ssb.settingsUtils.updateAllowCheckingNewVersion(
          req.allowCheckingNewVersion,
          (err: any) => {
            if (err) return console.error(err.message || err);
          },
        );
      }
    },
  });
}

function waitForIdentity() {
  return new Promise<boolean>((resolve) => {
    backend.addListener('identity', (msg: RestoreIdentityResponse) => {
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
