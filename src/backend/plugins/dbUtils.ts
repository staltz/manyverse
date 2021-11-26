// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ContactContent, Msg} from 'ssb-typescript';
import {Callback} from './helpers/types';
const pull = require('pull-stream');

export = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    rawLogReversed: 'source',
    mentionsMe: 'source',
    postsCount: 'async',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
    selfPrivateRootIdsLive: 'source',
  },
  permissions: {
    master: {
      allow: [
        'rawLogReversed',
        'mentionsMe',
        'postsCount',
        'selfPublicRoots',
        'selfPublicReplies',
        'selfPrivateRootIdsLive',
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
      fullMentions: mentions,
      isRoot,
      isPublic,
      isPrivate,
      descending,
      paginate,
      count,
      toPullStream,
      toCallback,
    } = ssb.db.operators;

    const PAGESIZE = 50;

    // Wait until migration progress is somewhere in the middle
    pull(
      ssb.syncing.migrating(),
      pull.filter((x: number) => x > 0.4 && x < 1),
      pull.take(1),
      pull.drain(() => {
        // Query some indexes to eagerly build them during migration
        // (1) non-dedicated author index needed for all profile screens
        pull(
          ssb.db.query(
            where(author(ssb.id, {dedicated: false})),
            toPullStream(),
          ),
          pull.take(1),
          pull.drain(),
        );
        // (2) votes prefix index needed as soon as threads load
        pull(
          ssb.db.query(where(votesFor('whatever')), toPullStream()),
          pull.take(1),
          pull.drain(),
        );
      }),
    );

    return {
      rawLogReversed() {
        return pull(
          ssb.db.query(descending(), paginate(PAGESIZE), toPullStream()),
          pull.map(pull.values),
          pull.flatten(),
        );
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
            paginate(PAGESIZE),
            toPullStream(),
          ),
          opts.live ? null : pull.map(pull.values),
          opts.live ? null : pull.flatten(),
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
    };
  },
};
