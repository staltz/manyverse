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

import xs, {Stream} from 'xstream';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import {isMsg, Msg, PeerMetadata, Content, FeedId, About} from '../ssb/types';
import blobUrlOpinion from '../ssb/opinions/blob/sync/url';
import aboutSyncOpinion from '../ssb/opinions/about/sync';
import makeKeysOpinion from '../ssb/opinions/keys';
import gossipOpinion from '../ssb/opinions/gossip';
import feedProfileOpinion from '../ssb/opinions/feed/pull/profile';
import xsFromPullStream from 'xstream-from-pull-stream';
import xsFromMutant from 'xstream-from-mutant';
import {NativeModules} from 'react-native';
const {computed} = require('mutant');
const sbotOpinion = require('patchcore/sbot');
const backlinksOpinion = require('patchcore/backlinks/obs');
const aboutOpinion = require('patchcore/about/obs');
const contactOpinion = require('patchcore/contact/obs');
const unboxOpinion = require('patchcore/message/sync/unbox');
const msgLikesOpinion = require('patchcore/message/obs/likes');
const ssbClient = require('react-native-ssb-client');
const depjectCombine = require('depject');
const Config = require('ssb-config/inject');
const nest = require('depnest');

const emptyHookOpinion = {
  gives: nest('sbot.hook.publish'),
  create: (api: any) => {
    return nest('sbot.hook.publish', () => {});
  },
};

const configOpinion = {
  gives: nest('config.sync.load'),
  create: (api: any) => {
    let config: any;
    return nest('config.sync.load', () => {
      if (!config) {
        config = Config('ssb');
        config.path = NativeModules.DataDir.PATH + '/.ssb';
      }
      return config;
    });
  },
};

function isNotSync(msg: any): boolean {
  return !msg.sync;
}

function addDerivedDataToMessage(msg: Msg, api: any): Stream<Msg> {
  if (isMsg(msg)) {
    const likes$ = xsFromMutant<Array<string>>(
      api.message.obs.likes[0](msg.key),
    );
    const name$ = xsFromMutant<string>(api.about.obs.name[0](msg.value.author));
    const imageUrl$ = xsFromMutant<string>(
      api.about.obs.imageUrl[0](msg.value.author),
    );
    return xs
      .combine(likes$, name$, imageUrl$)
      .map(([likes, name, imageUrl]) => {
        if (msg.value) {
          msg.value._derived = msg.value._derived || {};
          msg.value._derived.likes = likes;
          msg.value._derived.ilike = likes.some(
            key => key === api.keys.sync.id[0](),
          );
          msg.value._derived.about = {name, imageUrl, description: ''};
        }
        return msg;
      });
  } else {
    return xs.of(msg);
  }
}

export class SSBSource {
  public selfFeedId$: Stream<FeedId>;
  public publicFeed$: Stream<Msg>;
  public localSyncPeers$: Stream<Array<PeerMetadata>>;

  constructor(private api$: Stream<any>) {
    this.selfFeedId$ = api$.map(api => api.keys.sync.id[0]());

    this.publicFeed$ = api$
      .take(1)
      .map(api =>
        xsFromPullStream<any>(
          api.sbot.pull.feed[0]({reverse: false, limit: 100, live: true}),
        )
          .map(msg => addDerivedDataToMessage(msg, api))
          .compose(flattenConcurrently),
      )
      .flatten()
      .filter(isNotSync);

    this.localSyncPeers$ = api$
      .map(api => {
        const peers$ = api.sbot.obs.connectedPeers[1]() as Stream<
          Map<string, PeerMetadata>
        >;
        const peersArr$ = peers$.map(es6map => Array.from(es6map.entries()));
        const peersWithNames$ = peersArr$
          .map(peersArr =>
            xs.combine(
              ...peersArr.map(kv =>
                xsFromMutant<string>(api.about.obs.name[0](kv[1].key)).map(
                  name => ({...kv[1], name} as PeerMetadata),
                ),
              ),
            ),
          )
          .flatten();
        return peersWithNames$;
      })
      .flatten();
  }

  public profileFeed$(id: FeedId): Stream<Msg> {
    return this.api$
      .map(api =>
        xsFromPullStream<any>(
          api.feed.pull.profile[0](id)({
            lt: 100,
            live: true,
            limit: 100,
            reverse: false,
          }),
        )
          .map(msg => addDerivedDataToMessage(msg, api))
          .compose(flattenConcurrently),
      )
      .flatten()
      .filter(isNotSync);
  }

  public profileAbout$(id: FeedId): Stream<About> {
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

function dropCompletion(stream: Stream<any>): Stream<any> {
  return xs.merge(stream, xs.never());
}

export function ssbDriver(sink: Stream<Content>): SSBSource {
  const config = Config('ssb');
  config.path = NativeModules.DataDir.PATH + '/.ssb';
  const keys$ = xs.fromPromise(ssbClient.fetchKeys(config));

  const api$ = keys$
    .take(1)
    .compose(dropCompletion)
    .map(keys => {
      return depjectCombine([
        emptyHookOpinion,
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

  // Consume the sink
  api$
    .map(api => sink.map(newContent => [api, newContent]))
    .flatten()
    .addListener({
      next: ([api, newContent]) => {
        api.sbot.async.publish[0](newContent);
      },
    });

  return new SSBSource(api$);
}
