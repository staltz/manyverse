/* Copyright (C) 2018-2020 The Manyverse Authors.
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
  public isSyncing$: Stream<boolean>;
  public selfPublicRoots$: Stream<GetReadable<ThreadSummaryWithExtras>>;
  public selfPrivateRoots$: Stream<Msg>;
  public selfReplies$: Stream<GetReadable<MsgAndExtras>>;
  public publishHook$: Stream<Msg>;
  public acceptInviteResponse$: Stream<true | string>;
  public acceptDhtInviteResponse$: Stream<true | string>;
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

    this.isSyncing$ = this.fromPullStream((ssb) => ssb.syncing.stream()).map(
      (resp: any) => resp.started > 0,
    );

    this.selfPublicRoots$ = this.ssb$.map((ssb) => (opts?: any) =>
      ssb.threadsUtils.selfPublicRoots(opts),
    );

    this.selfPrivateRoots$ = this.fromPullStream<Msg>((ssb) =>
      ssb.threadsUtils.selfPrivateRoots(),
    );

    this.selfReplies$ = this.ssb$.map((ssb) => (opts?: any) =>
      ssb.threadsUtils.selfReplies(opts),
    );

    this.publishHook$ = this.ssb$
      .map((ssb) => ssb.hooks.publishStream())
      .flatten();

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.acceptDhtInviteResponse$ = xs.create<true | string>();

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

  public liteAbout$(ids: Array<FeedId>): Stream<Array<AboutAndExtras>> {
    return this.ssb$
      .map(async (ssb) => {
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
      .map((promise) => xs.fromPromise(promise))
      .flatten();
  }

  public profileAbout$(id: FeedId): Stream<AboutAndExtras> {
    return this.ssb$
      .map((ssb) => {
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
      .map((ssb) => {
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

export type DB2MigrateReq = {
  type: 'db2.migrate.start';
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

export type SettingsHopsReq = {
  type: 'settings.hops';
  hops: number;
};

export type SettingsBlobsPurgeReq = {
  type: 'settings.blobsPurge';
  storageLimit: number;
};

export type SettingsShowFollowsReq = {
  type: 'settings.showFollows';
  showFollows: boolean;
};

export type SettingsDetailedLogsReq = {
  type: 'settings.detailedLogs';
  detailedLogs: boolean;
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
  | DB2MigrateReq
  | ConnStartReq
  | ConnConnectReq
  | ConnRememberConnectReq
  | ConnFollowConnectReq
  | ConnDisconnectReq
  | ConnDisconnectForgetReq
  | ConnForgetReq
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
  sink
    .filter((r) => r.type === 'identity.create' || r.type === 'identity.use')
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
    next: async (req) => {
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

      if (req.type === 'db2.migrate.start') {
        ssb.db2migrate.start();
        return;
      }

      if (req.type === 'conn.start') {
        const [err1] = await runAsync(ssb.conn.start)();
        if (err1) return console.error(err1.message || err1);

        const [err2] = await runAsync(ssb.dhtInvite.start)();
        if (err2) return console.error(err2.message || err2);

        // FIXME: make a settings plugin in the backend, when it inits it
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
