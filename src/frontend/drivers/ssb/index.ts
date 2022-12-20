// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, MemoryStream, Listener} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import sampleCombine from 'xstream/extra/sampleCombine';
import xsFromCallback from 'xstream-from-callback';
import xsFromPullStream from 'xstream-from-pull-stream';
import runAsync = require('promisify-tuple');
import {Readable, Callback} from 'pull-stream';
const multicb = require('multicb');
const pull = require('pull-stream');
const Ref = require('ssb-ref');
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
  StorageStats,
  StorageUsedByFeed,
  CompactionProgress,
  SnapshotAbout,
  AboutSelf,
  ChannelSubscribeContent,
} from '~frontend/ssb/types';
import makeClient, {SSBClient} from '~frontend/ssb/client';
import {imageToImageUrl} from '~frontend/ssb/utils/from-ssb';
import backend from './backend';

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
  | 'IDENTITY_READY'
  | 'IDENTITY_CLEARED';

function dropCompletion<T>(stream: Stream<T>): Stream<T> {
  return xs.merge(stream, xs.never());
}

function isReady(client: SSBClient | null): client is SSBClient {
  return !!client && !client.closed;
}

export type GetReadable<T> = (opts?: any) => Readable<T>;

export class SSBSource {
  private ssb$: MemoryStream<SSBClient | null>;
  public selfFeedId$: MemoryStream<FeedId | null>;
  public publicRawFeed$: Stream<GetReadable<MsgAndExtras> | null>;
  public privateFeed$: Stream<GetReadable<
    PrivateThreadAndExtras<PostContent>
  > | null>;
  public privateLiveUpdates$: Stream<MsgId>;
  public preferredReactions$: Stream<Array<string>>;
  public mentionsFeed$: Stream<GetReadable<MsgAndExtras> | null>;
  public mentionsFeedLive$: Stream<MsgId>;
  public firewallAttempt$: Stream<GetReadable<FirewallAttempt> | null>;
  public selfPublicRoots$: Stream<ThreadSummaryWithExtras>;
  public selfPrivateRootIdsLive$: Stream<MsgId>;
  public selfRepliesLive$: Stream<MsgAndExtras<PostContent>>;
  public publishHook$: Stream<Msg>;
  public migrationProgress$: Stream<number>;
  public indexingProgress$: Stream<number>;
  public compactionProgress$: Stream<CompactionProgress>;
  public acceptInviteResponse$: Stream<true | string>;
  public consumeAliasResponse$: Stream<FeedId | false>;
  public peers$: Stream<Array<PeerKV>>;
  public stagedPeers$: Stream<Array<StagedPeerKV>>;
  public hashtagsSubscribed$: Stream<Array<string>>;

  constructor(ssb$: MemoryStream<SSBClient | null>) {
    this.ssb$ = ssb$;

    this.selfFeedId$ = this.ssb$
      .map((ssb) => (isReady(ssb) ? ssb.id : null))
      .remember();

    this.publicRawFeed$ = this.ssb$.map((ssb) =>
      isReady(ssb) ? () => ssb.threadsUtils.publicRawFeed() : null,
    );

    this.privateFeed$ = this.ssb$.map((ssb) =>
      isReady(ssb) ? (opts?: any) => ssb.threadsUtils.privateFeed(opts) : null,
    );

    this.privateLiveUpdates$ = this.fromPullStream<MsgId>((ssb) =>
      isReady(ssb) ? ssb.threadsUtils.privateUpdates() : pull.empty(),
    );

    this.preferredReactions$ = this.fromPullStream<Array<string>>((ssb) =>
      isReady(ssb) ? ssb.dbUtils.preferredReactions() : pull.values([[]]),
    )
      .compose(
        dropRepeats((before, after) => before.join('#') === after.join('#')),
      )
      .remember();

    this.hashtagsSubscribed$ = this.fromPullStream<Array<string>>((ssb) =>
      isReady(ssb) ? ssb.dbUtils.hashtagsSubscribed() : pull.values([]),
    )
      .compose(
        dropRepeats((before, after) => before.join('#') === after.join('#')),
      )
      .remember();

    this.mentionsFeed$ = this.ssb$.map((ssb) =>
      isReady(ssb) ? () => ssb.threadsUtils.mentionsFeed() : null,
    );

    this.mentionsFeedLive$ = this.fromPullStream<MsgId>((ssb) =>
      isReady(ssb)
        ? ssb.dbUtils.mentionsMe({live: true, old: false})
        : pull.empty(),
    );

    this.firewallAttempt$ = this.ssb$.map((ssb) =>
      isReady(ssb)
        ? () => ssb.connFirewall.attempts({old: true, live: false})
        : null,
    );

    this.selfPublicRoots$ = this.fromPullStream<ThreadSummaryWithExtras>(
      (ssb) =>
        isReady(ssb)
          ? ssb.threadsUtils.selfPublicRoots({live: true, old: false})
          : pull.empty(),
    );

    this.selfPrivateRootIdsLive$ = this.fromPullStream<MsgId>((ssb) =>
      isReady(ssb) ? ssb.dbUtils.selfPrivateRootIdsLive() : pull.empty(),
    );

    this.selfRepliesLive$ = this.fromPullStream<MsgAndExtras<PostContent>>(
      (ssb) =>
        isReady(ssb)
          ? ssb.threadsUtils.selfReplies({live: true, old: false})
          : pull.empty(),
    );

    this.publishHook$ = this.ssb$
      .map((ssb) => (isReady(ssb) ? ssb.hooks.publishStream() : xs.never()))
      .flatten();

    this.migrationProgress$ = this.fromPullStream<number>((ssb) =>
      isReady(ssb) ? ssb.db2migrate.progress() : pull.empty(),
    );

    this.indexingProgress$ = this.fromPullStream<number>((ssb) =>
      isReady(ssb) ? ssb.db.indexingProgress() : pull.empty(),
    );

    this.compactionProgress$ = this.fromPullStream<CompactionProgress>((ssb) =>
      isReady(ssb) ? ssb.db.compactionProgress() : pull.empty(),
    ).remember();

    // This is necessary to listen to the pull-stream as soon as possible and
    // remembering results, because even though xstream has the "remember"
    // functionality, pull-stream does NOT have "remembering" in the backend,
    // so we can't afford to miss events.
    //
    // The subscription here is harmless, we never need to unsubscribe from it.
    this.compactionProgress$.subscribe({next: () => {}});

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.consumeAliasResponse$ = xs.create<FeedId>();

    this.peers$ = this.fromPullStream<Array<PeerKV>>((ssb) =>
      isReady(ssb) ? ssb.connUtils.peers() : pull.values([[]]),
    ).remember();

    this.stagedPeers$ = this.fromPullStream<Array<StagedPeerKV>>((ssb) =>
      isReady(ssb) ? ssb.connUtils.stagedPeers() : pull.values([[]]),
    ).remember();
  }

  private fromPullStream<T>(
    fn: (ssb: SSBClient | null) => Readable<T>,
  ): Stream<T> {
    return this.ssb$.map(fn).map(xsFromPullStream).flatten() as Stream<T>;
  }

  private fromCallback<T>(
    fn: (ssb: SSBClient | null, cb: Callback<T>) => void,
  ): Stream<T> {
    return this.ssb$.map(xsFromCallback<T>(fn)).take(1).flatten();
  }

  public thread$(rootMsgId: MsgId, privately: boolean): Stream<AnyThread> {
    return this.fromCallback<AnyThread>((ssb, cb) =>
      isReady(ssb)
        ? ssb.threadsUtils.thread({root: rootMsgId, private: privately}, cb)
        : cb(new Error('Not Found')),
    );
  }

  public publicFeed$(
    onlyFollowing: boolean,
  ): Stream<GetReadable<ThreadSummaryWithExtras> | null> {
    return this.ssb$.map((ssb) =>
      isReady(ssb)
        ? (opts?: any) =>
            ssb.threadsUtils.publicFeed({
              ...opts,
              following: onlyFollowing,
            })
        : null,
    );
  }

  public hashtagsFeed$(
    hashtags: Array<string>,
  ): Stream<GetReadable<ThreadSummaryWithExtras> | null> {
    return this.ssb$.map((ssb) =>
      isReady(ssb) ? () => ssb.threadsUtils.hashtagFeed(hashtags) : null,
    );
  }

  public publicLiveUpdates$(onlyFollowing: boolean): Stream<null> {
    return this.fromPullStream((ssb) =>
      isReady(ssb)
        ? ssb.threadsUtils.publicUpdates(onlyFollowing)
        : pull.empty(),
    ).mapTo(null);
  }

  public hashtagLiveUpdates$(hashtags: Array<string>): Stream<null> {
    return this.fromPullStream((ssb) =>
      isReady(ssb) ? ssb.threadsUtils.hashtagUpdates(hashtags) : pull.empty(),
    ).mapTo(null);
  }

  public threadUpdates$(
    rootMsgId: MsgId,
    privately: boolean,
  ): Stream<MsgAndExtras> {
    return this.fromPullStream<MsgAndExtras>((ssb) =>
      isReady(ssb)
        ? ssb.threadsUtils.threadUpdates({root: rootMsgId, private: privately})
        : pull.empty(),
    );
  }

  public rehydrateMessage$(msg: MsgAndExtras): Stream<MsgAndExtras> {
    return this.fromCallback<MsgAndExtras>((ssb, cb) =>
      isReady(ssb)
        ? ssb.threadsUtils.rehydrateLiveExtras(msg, cb)
        : cb(null, msg),
    );
  }

  public profileFeed$(
    id: FeedId,
  ): Stream<GetReadable<ThreadSummaryWithExtras> | null> {
    return this.ssb$.map((ssb) =>
      isReady(ssb)
        ? (opts?: any) => ssb.threadsUtils.profileFeed(id, opts)
        : null,
    );
  }

  public postsCount$() {
    return this.fromCallback<number>((ssb, cb) =>
      isReady(ssb) ? ssb.dbUtils.postsCount(cb) : cb(null, 0),
    );
  }

  public hashtagCount$(hashtag: string) {
    return this.fromCallback<number>((ssb, cb) =>
      isReady(ssb) ? ssb.threadsUtils.hashtagCount(hashtag, cb) : cb(null, 0),
    );
  }

  public liteAboutReadable$(
    ids: Array<FeedId>,
  ): Stream<GetReadable<About> | null> {
    return this.ssb$.map((ssb) => () => {
      if (!isReady(ssb)) return null;
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
        if (!isReady(ssb)) return [];

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

  public getFriendsInCommon$(feedId: FeedId): Stream<Array<FeedId>> {
    return this.fromCallback<Array<FeedId>>((ssb, cb) =>
      isReady(ssb) ? ssb.dbUtils.friendsInCommon(feedId, cb) : cb(null, []),
    );
  }

  public profileAbout$(id: FeedId): Stream<AboutAndExtras> {
    return this.fromCallback<AboutSelf>((ssb, cb) =>
      isReady(ssb) ? ssb.cachedAboutSelf.get(id, cb) : cb(null, {}),
    ).map((profile) => ({
      id,
      ...profile,
      imageUrl: imageToImageUrl(profile.image),
    }));
  }

  public profileAboutLive$(id: FeedId): Stream<AboutAndExtras> {
    return this.fromPullStream<AboutSelf>((ssb) =>
      isReady(ssb) ? ssb.aboutSelf.stream(id) : pull.empty(),
    ).map((profile) => {
      const imageUrl = imageToImageUrl(profile.image);
      return {...profile, id, imageUrl} as AboutAndExtras;
    });
  }

  public isFollowing$(
    source: FeedId,
    dest: FeedId,
  ): Stream<SSBFriendsQueryDetails> {
    return this.fromCallback<SSBFriendsQueryDetails>((ssb, cb) =>
      isReady(ssb)
        ? ssb.friends.isFollowing({source, dest, details: true}, cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public isBlocking$(
    source: FeedId,
    dest: FeedId,
  ): Stream<SSBFriendsQueryDetails> {
    return this.fromCallback<SSBFriendsQueryDetails>((ssb, cb) =>
      isReady(ssb)
        ? ssb.friends.isBlocking({source, dest, details: true}, cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public snapshotAbout$(id: FeedId): Stream<SnapshotAbout> {
    return this.fromCallback<SnapshotAbout>((ssb, cb) =>
      isReady(ssb)
        ? ssb.dbUtils.snapshotAbout(id, cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public consumeAlias$(uri: string): Stream<FeedId> {
    return this.fromCallback<any>((ssb, cb) =>
      isReady(ssb) ? ssb.roomClient.consumeAliasUri(uri, cb) : cb(null, null),
    )
      .filter((x) => x !== null)
      .map((rpc) => rpc.id);
  }

  public getAliasesLive$(id: FeedId): Stream<Array<Alias>> {
    return this.fromPullStream<Array<Alias>>((ssb) =>
      isReady(ssb) ? ssb.aliasUtils.stream(id) : pull.empty(),
    );
  }

  public aliasRegistrationRooms$(): Stream<Array<PeerKV>> {
    return this.fromCallback<Array<PeerKV>>((ssb, cb) =>
      isReady(ssb) ? ssb.conn.dbPeers(cb) : cb(null, []),
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
    return this.fromCallback<string>((ssb, cb) => {
      if (!isReady(ssb)) return cb(new Error('ssb not ready'));

      return ssb.roomClient.registerAlias(
        roomId,
        alias,
        (err: any, res: string) => {
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
        },
      );
    });
  }

  public revokeAlias$(roomId: FeedId, alias: string): Stream<true> {
    return this.fromCallback<true>((ssb, cb) => {
      if (!isReady(ssb)) return cb(new Error('ssb not ready'));

      return ssb.roomClient.revokeAlias(
        roomId,
        alias,
        (err: any, res: true) => {
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
        },
      );
    });
  }

  public addBlobFromPath$(path: string): Stream<BlobId> {
    return this.fromCallback<BlobId>((ssb, cb) =>
      isReady(ssb)
        ? ssb.blobsUtils.addFromPath(path, cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public deleteBlob$(blobId: BlobId): Stream<null> {
    return this.fromCallback<null>((ssb, cb) =>
      isReady(ssb) ? ssb.blobs.rm(blobId, cb) : cb(new Error('ssb not ready')),
    );
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
      .map((ssb) => {
        if (!isReady(ssb)) return xs.of([]);

        return xsFromCallback<Array<MentionSuggestion>>(ssb.suggest.profile)(
          opts,
        ).map((arr) =>
          arr
            .filter((suggestion) => suggestion.id !== ssb.id)
            .map((suggestion) => ({
              ...suggestion,
              imageUrl: imageToImageUrl(suggestion.image),
            })),
        );
      })
      .flatten();
  }

  public searchPublicPosts$(
    text: string,
  ): Stream<GetReadable<MsgAndExtras<PostContent>> | null> {
    return this.ssb$.map((ssb) =>
      isReady(ssb) ? () => ssb.threadsUtils.searchPublicPosts(text) : null,
    );
  }

  public searchPublishHashtagSummaries$(
    text: string,
  ): Stream<GetReadable<ThreadSummaryWithExtras> | null> {
    return this.ssb$.map((ssb) =>
      isReady(ssb) ? () => ssb.threadsUtils.hashtagFeed([text]) : null,
    );
  }

  public produceSignInWebUrl$(serverId: FeedId): Stream<string> {
    return this.fromCallback<string>((ssb, cb) =>
      isReady(ssb)
        ? ssb.httpAuthClient.produceSignInWebUrl(serverId, cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public getMnemonic$(): Stream<string> {
    return this.fromCallback<string>((ssb, cb) =>
      isReady(ssb)
        ? ssb.keysUtils.getMnemonic(cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public getLogSize$(): Stream<number> {
    return this.fromPullStream<number>((ssb) =>
      isReady(ssb) ? ssb.resyncUtils.progress() : pull.empty(),
    );
  }

  public readSettings(): Stream<{
    hops?: number;
    blobsStorageLimit?: number;
    detailedLogs?: boolean;
    showFollows?: boolean;
    allowCheckingNewVersion?: boolean;
    enableFirewall?: boolean;
    allowCrashReports?: boolean;
  }> {
    return this.fromCallback<any>((ssb, cb) =>
      isReady(ssb) ? ssb.settingsUtils.read(cb) : cb(null, null),
    ).filter((x) => x !== null);
  }

  public getFirewallAttemptLive$(): Stream<GetReadable<FirewallAttempt> | null> {
    return this.ssb$.map((ssb) =>
      isReady(ssb)
        ? () => ssb.connFirewall.attempts({old: false, live: true})
        : null,
    );
  }

  public storageStats$(): Stream<StorageStats> {
    return this.fromCallback<StorageStats>((ssb, cb) =>
      isReady(ssb) ? ssb.storageUsed.stats(cb) : cb(new Error('ssb not ready')),
    );
  }

  public bytesUsedReadable$(): Stream<GetReadable<StorageUsedByFeed> | null> {
    type Tuple = [FeedId, number];
    type CB = Callback<StorageUsedByFeed>;
    return this.ssb$.map((ssb) => {
      if (!isReady(ssb)) return null;

      return () =>
        pull(
          ssb.deweird.source(['storageUsed', 'stream']),
          pull.asyncMap(([feedId, storageUsed]: Tuple, cb: CB) => {
            const done = multicb({pluck: 1});
            ssb.cachedAboutSelf.get(feedId, done());
            ssb.dbUtils.snapshotAbout(feedId, done());
            ssb.friends.isFollowing({source: ssb.id, dest: feedId}, done());
            ssb.friends.isBlocking({source: ssb.id, dest: feedId}, done());
            type Results = [AboutSelf, SnapshotAbout, boolean, boolean];
            done((err: any, results: Results) => {
              if (err) {
                cb(err);
                return;
              }
              const [about, snapshotAbout, youFollow, youBlock] = results;
              const name = about.name ?? snapshotAbout.name;
              const image = about.image;
              const imageUrl = imageToImageUrl(image);
              cb(null, {
                feedId,
                name,
                image,
                imageUrl,
                storageUsed,
                youFollow,
                youBlock,
              });
            });
          }),
        );
    });
  }

  public generateBlurhash$(blobId: string): Stream<string | undefined> {
    return this.fromCallback<string>((ssb, cb) =>
      isReady(ssb)
        ? ssb.blobsBlurhash.generate(blobId, {width: 48}, cb)
        : cb(new Error('ssb not ready')),
    );
  }

  public forceReindex$(): Stream<unknown> {
    return this.fromCallback<unknown>((ssb, cb) => {
      if (!isReady(ssb)) return cb(new Error('ssb not ready'));

      ssb.db.reset((err: any) => {
        if (err) return cb(err);
        ssb.dbUtils.warmUpJITDB((err: any) => {
          cb(err);
        });
      });
    });
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

export interface NukeReq {
  type: 'nuke';
}

export interface PublishReq {
  type: 'publish';
  content: NonNullable<Content | AliasContent | ChannelSubscribeContent>;
}

export interface PublishAboutReq {
  type: 'publishAbout';
  content: AboutContent;
}

export interface AcceptInviteReq {
  type: 'invite.accept';
  opts:
    | string
    | {
        invite: string;
        shouldPublish?: boolean;
      };
}

export interface ReplicationSchedulerStartReq {
  type: 'replicationScheduler.start';
}

export interface SuggestStartReq {
  type: 'suggest.start';
}

export interface FriendsPurgeStartReq {
  type: 'friendsPurge.start';
}

export interface CompactReq {
  type: 'db.compact';
}

export interface WarmUpJITDBReq {
  type: 'dbUtils.warmUpJITDB';
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

export interface ConnRebootReq {
  type: 'connReboot';
}

export interface EbtRequestReq {
  type: 'ebt.request';
  id: FeedId;
  requesting: boolean;
}

export interface EnableFirewallReq {
  type: 'resyncUtils.enableFirewall';
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

export interface SettingsEnableFirewallReq {
  type: 'settings.enableFirewall';
  enableFirewall: boolean;
}

export interface SettingsAllowCrashReportsReq {
  type: 'settings.allowCrashReports';
  allowCrashReports: boolean;
}

export type Req =
  | CreateIdentityReq
  | UseIdentityReq
  | MigrateIdentityReq
  | NukeReq
  | PublishReq
  | PublishAboutReq
  | AcceptInviteReq
  | ReplicationSchedulerStartReq
  | SuggestStartReq
  | FriendsPurgeStartReq
  | CompactReq
  | WarmUpJITDBReq
  | ConnStartReq
  | ConnConnectReq
  | ConnRememberConnectReq
  | ConnDisconnectReq
  | ConnDisconnectForgetReq
  | ConnForgetReq
  | ConnRebootReq
  | EbtRequestReq
  | EnableFirewallReq
  | RoomConsumeInviteUri
  | RoomSignInUri
  | RoomConsumeAliasUri
  | SettingsHopsReq
  | SettingsBlobsPurgeReq
  | SettingsShowFollowsReq
  | SettingsDetailedLogsReq
  | SettingsAllowCheckingNewVersionReq
  | SettingsEnableFirewallReq
  | SettingsAllowCrashReportsReq;

export function contentToPublishReq(
  content: NonNullable<Content | ChannelSubscribeContent>,
): PublishReq {
  return {type: 'publish', content};
}

async function consumeSink(
  sink: Stream<Req>,
  source: SSBSource,
  ssb$: Stream<SSBClient | null>,
) {
  let identityAvailable = false;

  const identityReq$ = sink.filter((r) => r.type.startsWith('identity.'));
  const nonIdentityReq$ = sink.filter((r) => !r.type.startsWith('identity.'));

  identityReq$.addListener({
    next: (req) => {
      switch (req.type) {
        case 'identity.create':
          if (!identityAvailable) {
            identityAvailable = true;
            backend.post('identity', 'CREATE');
          }
          return;

        case 'identity.use':
          if (!identityAvailable) {
            identityAvailable = true;
            backend.post('identity', 'USE');
          }
          return;

        case 'identity.migrate':
          if (!identityAvailable) {
            identityAvailable = true;
            backend.post('identity', 'MIGRATE');
          }
          return;
      }
    },
  });

  nonIdentityReq$.compose(sampleCombine(ssb$)).addListener({
    next: async ([req, ssb]) => {
      if (!isReady(ssb)) return;

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
        ssb.invite.accept(req.opts, (err: any) => {
          source.acceptInviteResponse$._n(err ? err.message || err : true);
        });
        return;
      }

      if (req.type === 'replicationScheduler.start') {
        ssb.replicationScheduler.start((err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'suggest.start') {
        ssb.suggest.start((err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'friendsPurge.start') {
        ssb.friendsPurge.start((err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'db.compact') {
        ssb.db.compact((err: any) => {
          if (err) return console.error(err.message || err);
        });
      }

      if (req.type === 'dbUtils.warmUpJITDB') {
        ssb.dbUtils.warmUpJITDB((err: any) => {
          if (err) return console.error(err.message || err);
        });
      }

      if (req.type === 'conn.start') {
        ssb.conn.start((err: any) => {
          if (err) return console.error(err.message || err);
        });
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

      if (req.type === 'connReboot') {
        const [e1] = await runAsync(ssb.conn.stop)();
        if (e1) return console.error(e1.message || e1);
        const [e2] = await runAsync(ssb.conn.start)();
        if (e2) return console.error(e2.message || e2);
        return;
      }

      if (req.type === 'ebt.request') {
        ssb.ebt.request(req.id, req.requesting, null, (err: any) => {
          if (err) return console.error(err.message || err);
        });
        return;
      }

      if (req.type === 'resyncUtils.enableFirewall') {
        ssb.resyncUtils.enableFirewall((err: any) => {
          if (err) return console.error(err.message || err);
        });
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

        const u = new URL(req.uri);
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

      if (req.type === 'settings.allowCheckingNewVersion') {
        ssb.settingsUtils.updateAllowCheckingNewVersion(
          req.allowCheckingNewVersion,
          (err: any) => {
            if (err) return console.error(err.message || err);
          },
        );
        return;
      }

      if (req.type === 'settings.enableFirewall') {
        ssb.settingsUtils.updateEnableFirewall(
          req.enableFirewall,
          (err: any) => {
            if (err) return console.error(err.message || err);
          },
        );
        return;
      }

      if (req.type === 'settings.allowCrashReports') {
        ssb.settingsUtils.updateAllowCrashReports(
          req.allowCrashReports,
          (err: any) => {
            if (err) return console.error(err.message || err);
          },
        );
        return;
      }

      if (req.type === 'nuke') {
        (ssb as any).close(true, () => {
          if (identityAvailable) {
            backend.post('identity', 'CLEAR');
            identityAvailable = false;
          }
          return;
        });
      }
    },
  });
}

export function ssbDriver(sink: Stream<Req>): SSBSource {
  const identityReady$ = xs.create<boolean>({
    start(listener: Listener<boolean>) {
      this.lowLevelListener = (msg: RestoreIdentityResponse) => {
        if (msg === 'IDENTITY_READY') listener.next(true);
        else if (msg === 'IDENTITY_CLEARED') listener.next(false);
      };
      backend.addListener('identity', this.lowLevelListener);
    },
    stop() {
      backend.removeListener('identity', this.lowLevelListener);
    },
  });

  const ssb$ = identityReady$
    .map((ready) => (ready ? xs.fromPromise(makeClient()) : xs.of(null)))
    .flatten()
    .compose(dropRepeats())
    .compose(dropCompletion)
    .remember();

  const source = new SSBSource(ssb$);
  consumeSink(sink, source, ssb$);
  return source;
}
