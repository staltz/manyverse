// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import fs = require('fs');
import path = require('path');
import {ContactContent, Msg, VoteContent} from 'ssb-typescript';
import {Callback} from './helpers/types';
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
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

export = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    rawLogReversed: 'source',
    mentionsMe: 'source',
    postsCount: 'async',
    preferredReactions: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
    selfPrivateRootIdsLive: 'source',
    exitReadOnlyMode: 'async',
  },
  permissions: {
    master: {
      allow: [
        'rawLogReversed',
        'mentionsMe',
        'postsCount',
        'preferredReactions',
        'selfPublicRoots',
        'selfPublicReplies',
        'selfPrivateRootIdsLive',
        'exitReadOnlyMode',
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
      batch,
      count,
      toPullStream,
      toCallback,
    } = ssb.db.operators;

    const BATCH_SIZE = 75;

    const reactionsCount = {
      _map: new Map<string, number>(),
      update(msg: Msg<VoteContent>) {
        const {expression, value} = msg.value.content.vote;
        if (value <= 0 || !expression) return;
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
          pullAsync((cb: Callback<Array<string>>) => {
            ssb.db.query(
              where(and(type('vote'), author(ssb.id, {dedicated: true}))),
              toCallback((err: any, msgs: Array<Msg<VoteContent>>) => {
                if (err) return cb(err);
                for (const msg of msgs) reactionsCount.update(msg);
                cb(null, reactionsCount.toArray());
              }),
            );
          }),

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

      exitReadOnlyMode(cb: Callback<void>) {
        if (process.env.MANYVERSE_PLATFORM !== 'desktop') {
          return cb(
            new Error('Cannot run exitReadOnlyMode unless we are on desktop.'),
          );
        }

        const SHARED_SSB_DIR = process.env.SHARED_SSB_DIR!;
        const MANYVERSE_SSB_DIR = process.env.MANYVERSE_SSB_DIR!;
        mkdirp.sync(MANYVERSE_SSB_DIR);

        // Move blobs folder from ~/.ssb to manyverse folder
        fs.rename(
          path.join(SHARED_SSB_DIR, 'blobs'),
          path.join(MANYVERSE_SSB_DIR, 'blobs'),
          (err) => {
            if (err) return cb(err);

            // Move ssb-db2 folder from ~/.ssb to manyverse folder
            fs.rename(
              path.join(SHARED_SSB_DIR, 'db2'),
              path.join(MANYVERSE_SSB_DIR, 'db2'),
              (err) => {
                if (err) return cb(err);

                // Close sbot
                ssb.close(true, () => {
                  // Move all other files
                  const files = [
                    'blobs_push',
                    'conn.json',
                    'conn-attempts.json',
                    'manyverse-settings.json',
                    'issue1223',
                    'issue1328',
                    'issue1486',
                    'issue1628',
                    'secret',
                  ];
                  for (const file of files) {
                    try {
                      fs.renameSync(
                        path.join(SHARED_SSB_DIR, file),
                        path.join(MANYVERSE_SSB_DIR, file),
                      );
                    } catch (err) {
                      if (err.code !== 'ENOENT') return cb(err);
                    }
                  }

                  // Delete old shared folder
                  rimraf.sync(SHARED_SSB_DIR);

                  // Restart Electron app
                  delete process.env.SSB_DIR;
                  delete process.env.SSB_DB2_READ_ONLY;
                  const {app} = require('electron');
                  app.relaunch();
                  app.quit();
                  cb();
                });
              },
            );
          },
        );
      },
    };
  },
};
