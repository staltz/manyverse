// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ContactContent, FeedId, Msg, VoteContent} from 'ssb-typescript';
import {Callback} from './helpers/types';
const QuickLRU = require('@alloc/quick-lru');
const pull = require('pull-stream');
const pullAsync = require('pull-async');
const cat = require('pull-cat');

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const DIG_UNICODE = '\u270c\ufe0f';
const HEART_UNICODE = '\u2764\ufe0f';

function voteExpressionToReaction(expression: string) {
  const lowCase = expression.toLowerCase();
  if (lowCase === 'like') return THUMBS_UP_UNICODE;
  if (lowCase === 'yup') return THUMBS_UP_UNICODE;
  if (lowCase === 'heart') return HEART_UNICODE;
  if (lowCase === 'dig') return DIG_UNICODE;
  if (expression.codePointAt(0) === 0x270c) return DIG_UNICODE;
  if (expression) return expression;
  return THUMBS_UP_UNICODE;
}

function isValidVoteMsg(msg: Msg<VoteContent>) {
  if (!msg) return false;
  if (!msg.value) return false;
  if (!msg.value.content) return false;
  if (!msg.value.content.vote) return false;
  if (!msg.value.content.vote.expression) return false;
  if (!msg.value.content.vote.value) return false;
  if (typeof msg.value.content.vote.value !== 'number') return false;
  if (isNaN(msg.value.content.vote.value)) return false;
  if (msg.value.content.vote.value < 0) return false;
  return true;
}

export = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    warmUpJITDB: 'sync',
    rawLogReversed: 'source',
    mentionsMe: 'source',
    postsCount: 'async',
    preferredReactions: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
    selfPrivateRootIdsLive: 'source',
    introducer: 'async',
  },
  permissions: {
    master: {
      allow: [
        'warmUpJITDB',
        'rawLogReversed',
        'mentionsMe',
        'postsCount',
        'preferredReactions',
        'selfPublicRoots',
        'selfPublicReplies',
        'selfPrivateRootIdsLive',
        'introducer',
      ],
    },
  },
  init: function init(ssb: any) {
    const {
      where,
      or,
      and,
      not,
      type,
      live: liveOperator,
      author,
      contact,
      votesFor,
      about,
      fullMentions: mentions,
      isRoot,
      hasRoot,
      hasFork,
      isPublic,
      isPrivate,
      descending,
      batch,
      count,
      toPullStream,
      toCallback,
    } = ssb.db.operators;

    const BATCH_SIZE = 100; // about 50 KB per batch

    const introducerCache = new QuickLRU({maxSize: 1000, maxAge: 30e3});

    const reactionsCount = {
      _map: new Map<string, number>(),
      isEmpty() {
        return this._map.size === 0;
      },
      update(msg: Msg<VoteContent>) {
        if (!isValidVoteMsg(msg)) return;
        const {expression} = msg.value.content.vote;
        const reaction = voteExpressionToReaction(expression);
        const previous = this._map.get(reaction) ?? 0;
        this._map.set(reaction, previous + 1);
      },
      toArray() {
        return [...this._map.entries()]
          .sort((a, b) => b[1] - a[1]) // sort by descending count
          .map((x) => x[0]); // pick the emoji string
      },
    };

    /**
     * Eagerly build some indexes to make the UI progress bar more stable.
     * (Knowing up-front all the "work" that has to be done makes it easier to
     * know how much work is left to do.) We always need these indexes anyway.
     */
    function warmUpJITDB() {
      const eagerIndexes = or(
        // value_author.32prefix:
        author(ssb.id, {dedicated: false}),
        // value_author_@SELFSSBID.index:
        author(ssb.id, {dedicated: true}),
        // value_content_about__map.32prefixmap:
        // value_content_type_about.index:
        about(ssb.id),
        // value_content_contact__map.32prefixmap
        // value_content_type_contact.index:
        contact(ssb.id),
        // value_content_fork__map.32prefixmap
        hasFork('whatever'),
        // value_content_root_.index
        isRoot(),
        // value_content_root__map.32prefixmap
        hasRoot('whatever'),
        // value_content_type_gathering.index:
        type('gathering'),
        // value_content_type_post.index
        type('post'),
        // value_content_type_pub.index
        type('pub'),
        // value_content_type_roomx2Falias.index
        type('room/alias'),
        // value_content_type_vote.index:
        // value_content_vote_link__map.32prefixmap:
        votesFor('whatever'),
        // meta_.index:
        isPublic(),
        // meta_private_true.index:
        isPrivate(),
      );
      ssb.db.prepare(eagerIndexes, () => {});
    }

    warmUpJITDB(); // call it ASAP

    return {
      warmUpJITDB,

      rawLogReversed() {
        return ssb.db.query(descending(), batch(BATCH_SIZE), toPullStream());
      },

      mentionsMe(opts: {live?: boolean; old?: boolean}) {
        return pull(
          ssb.db.query(
            where(
              and(
                isPublic(),
                or(and(type('post'), mentions(ssb.id)), contact(ssb.id)),
              ),
            ),
            descending(),
            opts.live ? liveOperator({old: opts.old}) : null,
            batch(BATCH_SIZE),
            toPullStream(),
          ),
          pull.filter((msg: Msg) => {
            // Allow all posts
            if (msg.value.content!.type === 'post') {
              return true;
            }
            // Only allow "followed" msgs
            if (msg.value.content!.type === 'contact') {
              const content = (msg as Msg<ContactContent>).value.content;
              const blocking = (content as any).flagged || content.blocking;
              const following = content.following;
              return blocking === undefined && following === true;
            }
            // Disallow unexpected cases
            return false;
          }),
          pull.map((msg: Msg) => (opts.live ? msg.key : msg)),
        );
      },

      postsCount(cb: Callback<number>) {
        ssb.db.query(
          where(and(isPublic(), type('post'))),
          count(),
          toCallback(cb),
        );
      },

      preferredReactions() {
        return cat([
          // First deliver latest preferred reactions
          reactionsCount.isEmpty()
            ? pullAsync((cb: Callback<Array<string>>) => {
                ssb.db.query(
                  where(and(type('vote'), author(ssb.id, {dedicated: true}))),
                  toCallback((err: any, msgs: Array<Msg<VoteContent>>) => {
                    if (err) return cb(err);
                    for (const msg of msgs) reactionsCount.update(msg);
                    cb(null, reactionsCount.toArray());
                  }),
                );
              })
            : pull.values([reactionsCount.toArray()]),

          // Then update preferred reactions when the user creates a vote
          pull(
            ssb.db.query(
              where(and(type('vote'), author(ssb.id, {dedicated: true}))),
              liveOperator({old: false}),
              toPullStream(),
            ),
            pull.map((msg: Msg<VoteContent>) => {
              reactionsCount.update(msg);
              return reactionsCount.toArray();
            }),
          ),
        ]);
      },

      selfPublicRoots(opts: {live?: boolean; old?: boolean}) {
        return ssb.db.query(
          where(
            and(
              author(ssb.id, {dedicated: true}),
              type('post'),
              isPublic(),
              isRoot(),
            ),
          ),
          opts.live ? liveOperator({old: opts.old}) : null,
          toPullStream(),
        );
      },

      selfPublicReplies(opts: {live?: boolean; old?: boolean}) {
        return ssb.db.query(
          where(
            and(
              author(ssb.id, {dedicated: true}),
              type('post'),
              isPublic(),
              not(isRoot()),
            ),
          ),
          opts.live ? liveOperator({old: opts.old}) : null,
          toPullStream(),
        );
      },

      selfPrivateRootIdsLive() {
        return pull(
          ssb.db.query(
            where(
              and(
                author(ssb.id, {dedicated: true}),
                type('post'),
                isPrivate(),
                isRoot(),
              ),
            ),
            liveOperator({old: false}),
            toPullStream(),
          ),
          pull.map((msg: Msg) => msg.key),
        );
      },

      introducer(feedId: FeedId, cb: Callback<readonly [FeedId, number]>) {
        if (feedId === ssb.id) return cb(null, [ssb.id, 0]);

        if (introducerCache.has(feedId)) {
          cb(null, introducerCache.get(feedId)!);
          return;
        }

        ssb.friends.hops(
          {start: ssb.id, reverse: false},
          (err: any, myHops: any) => {
            if (err) return cb(err);
            if (feedId in myHops && myHops[feedId] === 1) {
              introducerCache.set(feedId, [feedId, 1]);
              return cb(null, [feedId, 1]);
            }

            ssb.friends.hops(
              {start: feedId, reverse: true, max: 1},
              (err: any, theirHops: any) => {
                if (err) return cb(err);
                const theirFollowers = Object.keys(theirHops).filter(
                  (id) => theirHops[id] > 0,
                );
                const closest = Object.entries<number>(myHops)
                  .filter(([, dist]) => dist > 0)
                  .filter(([id]) => theirFollowers.includes(id))
                  .map(([id, dist]) => [id, dist + 1] as const)
                  .sort(([, dist1], [, dist2]) => dist1 - dist2)[0];
                if (!closest) return cb(new Error('could not find introducer'));
                introducerCache.set(feedId, closest);
                return cb(null, closest);
              },
            );
          },
        );
      },
    };
  },
};
