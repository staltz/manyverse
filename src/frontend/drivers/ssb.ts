/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, MemoryStream} from 'xstream';
import {
  Msg,
  PeerMetadata,
  Content,
  FeedId,
  About,
  MsgId,
  AboutContent,
} from 'ssb-typescript';
import {isMsg, isRootPostMsg, isReplyPostMsg} from 'ssb-typescript/utils';
import {Thread as ThreadData} from 'ssb-threads/types';
import aboutSyncOpinion from '../../ssb/opinions/about/sync';
import aboutOpinion = require('../../ssb/opinions/about/obs');
import makeKeysOpinion from '../../ssb/opinions/keys';
import sbotOpinion from '../../ssb/opinions/sbot';
import gossipOpinion from '../../ssb/opinions/gossip';
import publishHookOpinion from '../../ssb/opinions/hook';
import contactOpinion = require('../../ssb/opinions/contact/obs');
import configOpinion from '../../ssb/opinions/config';
import {ssbKeysPath} from '../../ssb/defaults';
import xsFromCallback from 'xstream-from-callback';
import runAsync = require('promisify-tuple');
import xsFromPullStream from 'xstream-from-pull-stream';
import {Readable, Callback} from '../../typings/pull-stream';
import {shortFeedId} from '../../ssb/from-ssb';
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');
const pull = require('pull-stream');
const cat = require('pull-cat');
const ssbKeys = require('react-native-ssb-client-keys');
const depjectCombine = require('depject');

export type MsgAndExtras<C = Content> = Msg<C> & {
  value: {
    _$manyverse$metadata: {
      likes: Stream<Array<FeedId>>;
      about: {
        name: string;
        imageUrl: string | null;
      };
    };
  };
};

export type ThreadAndExtras = {
  messages: Array<MsgAndExtras>;
  full: boolean;
  errorReason?: 'blocked' | 'missing' | 'unknown';
};

export type BTPeer = {remoteAddress: string; id: string; displayName: string};

function btPeerToStagedPeerMetadata(p: BTPeer): StagedPeerMetadata {
  return {
    key:
      `bt:${p.remoteAddress.split(':').join('')}` +
      '~' +
      `shs:${p.id.replace(/^\@/, '')}`,
    source: 'bt',
    note: p.displayName,
  };
}

function btPeerNotYetConnected(btp: BTPeer, connecteds: Array<PeerMetadata>) {
  return connecteds.findIndex(p => p.key === btp.id) === -1;
}

export type StagedPeerMetadata = {
  key: string;
  source: 'local' | 'dht' | 'pub' | 'bt';
  role?: 'client' | 'server';
  note?: string;
};

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
        let image: string | null = val;
        if (!!val && typeof val === 'object' && val.link) image = val.link;
        const imageUrl: string | null = image ? blobIdToUrl(image) : null;
        const likes = xsFromPullStream(api.sbot.pull.voterStream[0](msg.key))
          .startWith([]);
        const m = msg as MsgAndExtras;
        m.value._$manyverse$metadata = m.value._$manyverse$metadata || {
          likes,
          about: {name, imageUrl},
        };
        cb(null, m);
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
  public peers$: Stream<Array<PeerMetadata>>;
  public acceptInviteResponse$: Stream<true | string>;
  public acceptDhtInviteResponse$: Stream<true | string>;
  public hostingDhtInvites$: Stream<Array<HostingDhtInvite>>;
  public stagedPeers$: Stream<Array<StagedPeerMetadata>>;
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
          allowlist: ['post'],
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
            allowlist: ['post'],
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

    this.peers$ = api$
      .map(api => {
        const peers$ = api.sbot.obs.connectedPeers[0]() as Stream<
          Map<string, PeerMetadata>
        >;
        const normalPeersArr$ = peers$
          .map(es6map => Array.from(es6map.entries()))
          .startWith([]);

        const dhtClientsArr$ = this.hostingDhtInvites$
          .map(invites =>
            invites.filter(invite => invite.online).map(
              invite =>
                [
                  invite.claimer,
                  {
                    host: invite.seed,
                    port: 0,
                    key: invite.claimer,
                    source: 'dht' as any,
                    client: true,
                    state: 'connected',
                    stateChange: 0,
                  } as PeerMetadata,
                ] as [string, PeerMetadata],
            ),
          )
          .startWith([]);

        const peersArr$ = xs
          .combine(normalPeersArr$, dhtClientsArr$)
          .map(([peers1, peers2]) => peers1.concat(peers2));

        const peersWithExtras$ = peersArr$
          .map(peersArr =>
            xs.combine(
              ...peersArr.map(kv =>
                (api.about.obs.name[0](kv[1].key) as Stream<string>)
                  .map(name => ({...kv[1], name} as PeerMetadata))
                  .map(peer =>
                    (api.about.obs.imageUrl[0](peer.key) as Stream<string>).map(
                      imageUrl => ({...peer, imageUrl} as PeerMetadata),
                    ),
                  )
                  .flatten(),
              ),
            ),
          )
          .flatten();
        return peersWithExtras$;
      })
      .flatten();

    this.acceptInviteResponse$ = xs.create<true | string>();
    this.acceptDhtInviteResponse$ = xs.create<true | string>();

    this.stagedPeers$ = api$
      .map(api => {
        const hosting$ = this.hostingDhtInvites$
          .map(invites =>
            invites.filter(invite => !invite.online).map(
              ({seed}) =>
                ({
                  key: seed,
                  source: 'dht',
                  role: 'server',
                } as StagedPeerMetadata),
            ),
          )
          .startWith([]);

        const claiming$: Stream<Array<StagedPeerMetadata>> = xsFromPullStream(
          api.sbot.pull.claimingDhtInvites[0](),
        )
          .map((invites: Array<string>) =>
            invites.map(
              invite =>
                ({
                  key: invite,
                  source: 'dht',
                  role: 'client',
                } as StagedPeerMetadata),
            ),
          )
          .startWith([]);

        const bluetoothEnabled$: Stream<
          boolean
        > = api.sbot.obs.bluetoothEnabled[0]();

        const bluetoothNearby$: Stream<Array<BTPeer>> = xsFromPullStream(
              api.sbot.pull.nearbyBluetoothPeers[0](1000),
            ).map((result: any) => result.discovered);

        const bluetoothConnected$ = this.peers$.map(peers =>
          peers.filter(p => (p.source as any) === 'bt'),
        );

        const bluetooth$ = xs
          .combine(bluetoothEnabled$, bluetoothNearby$, bluetoothConnected$)
          .map(([enabled, nearbys, connecteds]) =>
            // If bluetooth is disabled, bluetoothNearby$ does not emit anything until it is enabled again,
            // so we use the 'enabled' boolean to stop peers being displayed which were on the list just
            // before bluetooth was disabled.
            nearbys.filter(btPeer => enabled && btPeerNotYetConnected(btPeer, connecteds)),
          )
          .map(btPeers => btPeers.map(btPeerToStagedPeerMetadata))
          .startWith([]);

        return xs.combine(bluetooth$, hosting$, claiming$);
      })
      .flatten()
      .map(([bluetooth, hosting, claiming]) => [
        ...bluetooth,
        ...hosting,
        ...claiming,
      ]);

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
          allowlist: ['post'],
          ...opts,
        }),
        pull.asyncMap(mutateThreadWithLiveExtras(api)),
      ),
    );
  }

  public profileAbout$(id: FeedId): Stream<About & {id: FeedId}> {
    return this.api$
      .map(api => {
        const name$ = api.about.obs.name[0](id) as Stream<string>;
        const color$ = api.about.obs.color[0](id) as Stream<string>;
        const imageUrl$ = api.about.obs.imageUrl[0](id) as Stream<string>;
        const following$ = api.contact.obs.tristate[0](
          api.keys.sync.id[0](),
          id,
        ) as Stream<boolean | null>;
        const description$ = api.about.obs.description[0](id) as Stream<string>;
        return xs
          .combine(name$, color$, description$, following$, imageUrl$)
          .map(([name, color, description, following, imageUrl]) => ({
            name,
            color,
            description,
            imageUrl,
            following,
            id,
          }));
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
        aboutSyncOpinion,
        configOpinion,
        makeKeysOpinion(keys),
        sbotOpinion,
        gossipOpinion,
        aboutOpinion,
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
          const [err] = await runAsync(api.sbot.async.gossipConnect[0])(addr);
          if (err) return console.error(err.message || err);

          // check if following
          const selfId = api.keys.sync.id[0]();
          const friendId = '@' + addr.split('shs:')[1];
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
