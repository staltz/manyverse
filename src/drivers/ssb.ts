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
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import {isMsg, Msg, PeerMetadata, Content} from '../types';
const ssbClient = require('react-native-ssb-client');
const depjectCombine = require('depject');
const pull = require('pull-stream');
const {watch, Set: MutantSet} = require('mutant');
const sbotOpinion = require('patchcore/sbot');
const msgLikesOpinion = require('patchcore/message/obs/likes');
const unboxOpinion = require('patchcore/message/sync/unbox');
const backlinksOpinion = require('patchcore/backlinks/obs');
const aboutOpinion = require('patchcore/about/obs');
const blobUrlOpinion = require('patchcore/blob/sync/url');
const Config = require('ssb-config/inject');
const nest = require('depnest');

const emptyHookOpinion = {
  gives: nest('sbot.hook.publish'),
  create: (api: any) => {
    return nest('sbot.hook.publish', () => {});
  }
};

const configOpinion = {
  gives: nest('config.sync.load'),
  create: (api: any) => {
    let config: any;
    return nest('config.sync.load', () => {
      if (!config) {
        config = Config('ssb');
      }
      return config;
    });
  }
};

function makeKeysOpinion(keys: any): any {
  const keysOpinion = {
    needs: nest('config.sync.load', 'first'),
    gives: nest({
      'keys.sync': ['load', 'id']
    }),

    create: (api: any) => {
      return nest({
        'keys.sync': {load, id}
      });
      function id() {
        return load().id;
      }
      function load() {
        return keys;
      }
    }
  };
  return keysOpinion;
}

const metadataOpinion = {
  gives: nest('sbot.obs.connectedPeers'),
  needs: nest('sbot.obs.connection', 'first'),
  create: (api: any) => {
    const connectedPeers = MutantSet();
    watch(api.sbot.obs.connection, (sbot: any) => {
      if (sbot) {
        sbot.gossip.peers((err: any, peers: Array<PeerMetadata>) => {
          if (err) return console.error(err);
          connectedPeers.set(peers.filter(x => x.state === 'connected'));
        });
        pull(
          sbot.gossip.changes(),
          pull.drain((data: any) => {
            if (data.peer) {
              if (data.type === 'remove') {
                connectedPeers.delete(data.peer.key);
              } else {
                if (data.peer.source === 'local') {
                }
                if (data.peer.state === 'connected') {
                  connectedPeers.add(data.peer.key);
                } else {
                  connectedPeers.delete(data.peer.key);
                }
              }
            }
          })
        );
      }
    });

    return {
      sbot: {
        obs: {
          connectedPeers: () => connectedPeers
        }
      }
    };
  }
};

function xsFromPullStream<T>(pullStream: any): Stream<T> {
  return xs.create({
    start(listener: Listener<T>): void {
      const drain = function drain(read: Function) {
        read(null, function more(end: any | boolean, data: T) {
          if (end === true) {
            listener.complete();
            return;
          }
          if (end) {
            listener.error(end);
            return;
          }
          listener.next(data);
          read(null, more);
        });
      };
      try {
        drain(pullStream);
      } catch (e) {
        listener.error(e);
      }
    },
    stop(): void {}
  });
}

function xsFromMutant<T>(mutantStream: any): Stream<T> {
  return xs.create({
    start(listener: Listener<T>): void {
      watch(mutantStream, (value: T) => {
        listener.next(value);
      });
    },
    stop(): void {}
  });
}

function isNotSync(msg: any): boolean {
  return !msg.sync;
}

export type SSBSource = {
  feed: Stream<any>;
  connectedPeers: Stream<Array<PeerMetadata>>;
};

function addDerivedDataToMessage(msg: Msg, api: any): Stream<Msg> {
  if (isMsg(msg)) {
    const likes$ = xsFromMutant(api.message.obs.likes[0](msg.key));
    const name$ = xsFromMutant(api.about.obs.name[0](msg.value.author));
    return xs
      .combine(likes$, name$)
      .map(([likes, name]: [Array<string>, string]) => {
        if (msg.value) {
          msg.value._derived = msg.value._derived || {};
          msg.value._derived.likes = likes;
          msg.value._derived.ilike = likes.some(
            key => key === api.keys.sync.id[0]()
          );
          msg.value._derived.about = {name};
        }
        return msg;
      });
  } else {
    return xs.of(msg);
  }
}

export function ssbDriver(sink: Stream<Content>): SSBSource {
  const keys$ = xs.fromPromise(ssbClient.fetchKeys(Config('ssb')));

  const api$ = keys$.map(keys => {
    return depjectCombine([
      emptyHookOpinion,
      configOpinion,
      blobUrlOpinion,
      makeKeysOpinion(keys),
      sbotOpinion,
      metadataOpinion,
      backlinksOpinion,
      aboutOpinion,
      unboxOpinion,
      msgLikesOpinion
    ]);
  });

  const feed$ = api$
    .take(1)
    .map(api =>
      xsFromPullStream<any>(
        api.sbot.pull.feed[0]({reverse: false, limit: 100, live: true})
      )
        .map(msg => addDerivedDataToMessage(msg, api))
        .compose(flattenConcurrently)
    )
    .flatten()
    .filter(isNotSync);

  const connectedPeers$ = api$
    .map(api => xsFromMutant<any>(api.sbot.obs.connectedPeers[1]()))
    .flatten();

  api$
    .map(api => sink.map(newContent => [api, newContent]))
    .flatten()
    .addListener({
      next: ([api, newContent]) => {
        api.sbot.async.publish[0](newContent);
      }
    });

  return {
    feed: feed$,
    connectedPeers: connectedPeers$
  };
}
