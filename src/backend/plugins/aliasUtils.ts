// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {AliasContent, FeedId, Msg} from 'ssb-typescript';
import {Callback} from './helpers/types';
const pull = require('pull-stream');
const pullAsync = require('pull-async');
const cat = require('pull-cat');
const Ref = require('ssb-ref');
const {
  where,
  and,
  author,
  type,
  live,
  toPullStream,
} = require('ssb-db2/operators');

type Alias = Required<Omit<AliasContent, 'type' | 'action'>>;

function makeID(room: FeedId, alias: string) {
  return `${room}~${alias}`;
}

export = {
  name: 'aliasUtils',
  version: '1.0.0',
  manifest: {
    get: 'async',
    stream: 'source',
  },
  permissions: {
    master: {
      allow: ['get', 'stream'],
    },
  },
  init: function init(ssb: any) {
    function getMap(feedId: FeedId, cb: Callback<Map<string, Alias>>) {
      return pull(
        ssb.db.query(
          where(
            and(
              author(feedId, {dedicated: feedId === ssb.id}),
              type('room/alias'),
            ),
          ),
          toPullStream(),
        ),
        pull.collect((err: any, msgs: Array<Msg<AliasContent>>) => {
          if (err) {
            cb(err);
            return;
          }
          const map = new Map<string, Alias>();
          for (const msg of msgs) {
            if (!msg.value?.content) continue;
            const {action, alias, aliasURL, room} = msg.value?.content;
            if (!room) continue;
            if (!Ref.isFeed(room)) continue;
            if (!alias) continue;
            if (action !== 'registered' && action !== 'revoked') continue;
            if (action === 'registered') {
              if (!aliasURL) continue;
              map.set(makeID(room, alias), {alias, aliasURL, room});
            } else {
              map.delete(makeID(room, alias));
            }
          }
          cb(null, map);
        }),
      );
    }

    function get(feedId: FeedId, cb: Callback<Array<Alias>>) {
      getMap(feedId, (err, map) => {
        if (err) cb(err);
        else cb(null, [...map!.values()]);
      });
    }

    function stream(feedId: FeedId) {
      let map: Map<string, Alias>;
      return cat([
        // First deliver latest information on past alias msgs
        pullAsync((cb: Callback<Array<Alias>>) => {
          getMap(feedId, (err, m) => {
            if (err) cb(err);
            else {
              map = m!;
              cb(null, [...map.values()]);
            }
          });
        }),

        // Then update the array as live msgs appear
        pull(
          ssb.db.query(
            where(
              and(
                author(feedId, {dedicated: feedId === ssb.id}),
                type('room/alias'),
              ),
            ),
            live({old: false}),
            toPullStream(),
          ),
          pull.filter((msg: Msg<AliasContent>) => {
            if (!msg.value?.content) return false;
            const {action, alias, aliasURL, room} = msg.value?.content;
            if (!room) return false;
            if (!Ref.isFeed(room)) return false;
            if (!alias) return false;
            if (action !== 'registered' && action !== 'revoked') return false;
            if (action === 'registered' && !aliasURL) return false;
            return true;
          }),
          pull.map((msg: Msg<AliasContent>) => {
            const {alias, aliasURL, room, action} = msg.value
              ?.content as Required<AliasContent>;
            if (action === 'registered') {
              map.set(makeID(room, alias), {alias, aliasURL, room});
            } else {
              map.delete(makeID(room, alias));
            }
            return [...map.values()];
          }),
        ),
      ]);
    }

    return {
      get,
      stream,
    };
  },
};
