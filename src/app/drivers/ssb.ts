/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream, Listener} from 'xstream';
import {Msg, PeerMetadata, Content, FeedId, About, MsgId} from 'ssb-typescript';
import {isMsg, isRootPostMsg, isReplyPostMsg} from 'ssb-typescript/utils';
import {Thread as ThreadData} from 'ssb-threads/types';
import blobUrlOpinion from '../../ssb/opinions/blob/sync/url';
import aboutSyncOpinion from '../../ssb/opinions/about/sync';
import makeKeysOpinion from '../../ssb/opinions/keys';
import sbotOpinion from '../../ssb/opinions/sbot';
import gossipOpinion from '../../ssb/opinions/gossip';
import publishHookOpinion from '../../ssb/opinions/hook';
import configOpinion from '../../ssb/opinions/config';
import feedProfileOpinion from '../../ssb/opinions/feed/pull/profile';
import {ssbKeysPath} from '../../ssb/defaults';
import xsFromCallback from 'xstream-from-callback';
import xsFromMutant from 'xstream-from-mutant';
import xsFromPullStream from 'xstream-from-pull-stream';
import {Readable} from '../../typings/pull-stream';
import {Mutant} from 'react-mutant-hoc';
const pull = require('pull-stream');
const {computed} = require('mutant');
const thenable = require('pull-thenable');
const pify = require('pify');
const sleep = require('delay');
const backlinksOpinion = require('patchcore/backlinks/obs');
const aboutOpinion = require('patchcore/about/obs');
const contactOpinion = require('patchcore/contact/obs');
const unboxOpinion = require('patchcore/message/sync/unbox');
const msgLikesOpinion = require('patchcore/message/obs/likes');
const ssbKeys = require('react-native-ssb-client-keys');
const depjectCombine = require('depject');

export type MsgAndExtras<C = Content> = Msg<C> & {
  value: {
    _streams: {
      likes: Mutant<Array<FeedId>>;
      about: {
        name: Mutant<string>;
        imageUrl: Mutant<string>;
      };
    };
  };
};

export type ThreadAndExtras = {
  messages: Array<MsgAndExtras>;
  full: boolean;
};

function mutateMsgWithLiveExtras(api: any) {
  return (msg: Msg) => {
    if (isMsg(msg)) {
      const likes = api.message.obs.likes[0](msg.key);
      const name = api.about.obs.name[0](msg.value.author);
      const imageUrl = api.about.obs.imageUrl[0](msg.value.author);
      if (msg.value) {
        const m = msg as MsgAndExtras;
        m.value._streams = m.value._streams || {likes, about: {name, imageUrl}};
      }
    }
    return msg;
  };
}

function mutateThreadWithLiveExtras(api: any) {
  return (thread: ThreadData) => {
    for (const msg of thread.messages) {
      mutateMsgWithLiveExtras(api)(msg);
    }
    return thread;
  };
}

export type GetReadable<T> = (opts?: any) => Readable<T>;

export class SSBSource {
  public selfFeedId$: Stream<FeedId>;
  public publicRawFeed$: Stream<GetReadable<MsgAndExtras>>;
  public publicFeed$: Stream<GetReadable<ThreadAndExtras>>;
  public publicLiveUpdates$: Stream<null>;
  public isSyncing$: Stream<boolean>;
  public selfRoots$: Stream<GetReadable<ThreadAndExtras>>;
  public selfReplies$: Stream<GetReadable<MsgAndExtras>>;
  public publishHook$: Stream<Msg>;
  public peers$: Stream<Array<PeerMetadata>>;
  public acceptInviteResponse$: Stream<true | string>;

  constructor(private api$: Stream<any>) {
    this.selfFeedId$ = api$.map(api => api.keys.sync.id[0]());

    this.publicRawFeed$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.feed[0]({reverse: true, live: false, ...opts}),
        pull.map(mutateMsgWithLiveExtras(api)),
      ),
    );

    this.publicFeed$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.publicThreads[0]({reverse: true, live: false, ...opts}),
        pull.map(mutateThreadWithLiveExtras(api)),
      ),
    );

    this.publicLiveUpdates$ = api$
      .map(api => xsFromPullStream(api.sbot.pull.publicUpdates[0]({})))
      .flatten()
      .mapTo(null);

    this.isSyncing$ = api$
      .map(api => {
        const getProgressStatus = pify(api.sbot.async.status[0]);
        const nextUpdate = thenable(
          api.sbot.pull.publicUpdates[0]({allowlist: undefined}),
        );
        return xs.create<boolean>({
          async start(listener: Listener<boolean>) {
            let s: any;
            this.continue = true;
            while (this.continue) {
              do {
                listener.next(false);
                await nextUpdate;
                listener.next(true);
                s = await getProgressStatus();
              } while (
                s.progress.indexes.current === s.progress.indexes.target
              );
              do {
                await sleep(300);
                s = await getProgressStatus();
              } while (s.progress.indexes.current < s.progress.indexes.target);
            }
          },
          stop() {
            this.continue = false;
          },
        });
      })
      .flatten();

    this.selfRoots$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.userFeed[0]({id: api.keys.sync.id[0](), ...opts}),
        pull.filter(isRootPostMsg),
        pull.map((msg: Msg) => ({messages: [msg], full: true} as ThreadData)),
        pull.map(mutateThreadWithLiveExtras(api)),
      ),
    );

    this.selfReplies$ = api$.map(api => (opts?: any) =>
      pull(
        api.sbot.pull.userFeed[0]({id: api.keys.sync.id[0](), ...opts}),
        pull.filter(isReplyPostMsg),
        pull.map(mutateMsgWithLiveExtras(api)),
      ),
    );

    this.publishHook$ = api$
      .map(api => api.sbot.hook.publishStream[0]() as Stream<Msg>)
      .flatten();

    this.peers$ = api$
      .map(api => {
        const peers$ = api.sbot.obs.connectedPeers[0]() as Stream<
          Map<string, PeerMetadata>
        >;
        const peersArr$ = peers$.map(es6map => Array.from(es6map.entries()));
        const peersWithExtras$ = peersArr$
          .map(peersArr =>
            xs.combine(
              ...peersArr.map(kv =>
                xsFromMutant<string>(api.about.obs.name[0](kv[1].key))
                  .map(name => ({...kv[1], name} as PeerMetadata))
                  .map(peer =>
                    xsFromMutant<string>(
                      api.about.obs.imageUrl[0](peer.key),
                    ).map(imageUrl => ({...peer, imageUrl} as PeerMetadata)),
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
  }

  public thread$(rootMsgId: MsgId): Stream<ThreadAndExtras> {
    const apiToThread = (api: any, cb: any) => {
      pull(
        api.sbot.pull.thread[0]({root: rootMsgId}),
        pull.map(mutateThreadWithLiveExtras(api)),
        pull.take(1),
        pull.drain((thread: ThreadAndExtras) => cb(null, thread)),
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
          ...opts,
        }),
        pull.map(mutateThreadWithLiveExtras(api)),
      ),
    );
  }

  public profileAbout$(id: FeedId): Stream<About & {id: FeedId}> {
    return this.api$
      .map(api => {
        const name$ = xsFromMutant<string>(api.about.obs.name[0](id));
        const color$ = xsFromMutant<string>(api.about.obs.color[0](id));
        const imageUrl$ = xsFromMutant<string>(api.about.obs.imageUrl[0](id));
        const yourFollows = api.contact.obs.following[0](api.keys.sync.id[0]());
        const following$ = xsFromMutant<true | null | false>(
          computed([yourFollows], (youFollow: any) => youFollow.includes(id)),
        );
        const description$ = xsFromMutant<string>(
          api.about.obs.description[0](id),
        );
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
}

export type PublishReq = {
  type: 'publish';
  content: Content;
};

export type AcceptInviteReq = {
  type: 'invite.accept';
  invite: string;
};

export type Req = PublishReq | AcceptInviteReq;

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
        blobUrlOpinion,
        aboutSyncOpinion,
        configOpinion,
        makeKeysOpinion(keys),
        sbotOpinion,
        feedProfileOpinion,
        gossipOpinion,
        backlinksOpinion,
        aboutOpinion,
        contactOpinion,
        unboxOpinion,
        msgLikesOpinion,
      ]);
    })
    .remember();

  const source = new SSBSource(api$);

  // Consume the sink
  api$
    .map(api => sink.map(req => [api, req] as [any, Req]))
    .flatten()
    .addListener({
      next: ([api, req]) => {
        if (req.type === 'publish') {
          api.sbot.async.publish[0](req.content);
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
      },
    });

  return source;
}
