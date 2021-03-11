/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Msg} from 'ssb-typescript';
const pull = require('pull-stream');

export = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    rawLogReversed: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
    selfPrivateRootIdsLive: 'source',
  },
  permissions: {
    master: {
      allow: [
        'rawLogReversed',
        'selfPublicRoots',
        'selfPublicReplies',
        'selfPrivateRootIdsLive',
      ],
    },
  },
  init: function init(ssb: any) {
    const {
      and,
      not,
      type,
      live: liveOperator,
      author,
      isRoot,
      isPublic,
      isPrivate,
      descending,
      votesFor,
      toPullStream,
    } = ssb.db.operators;

    // Wait until migration progress is somewhere in the middle
    pull(
      ssb.syncing.migrating(),
      pull.filter((x: number) => x > 0.4 && x < 1),
      pull.take(1),
      pull.drain(() => {
        // Query some indexes to eagerly build them during migration
        // (1) non-dedicated author index needed for all profile screens
        pull(
          ssb.db.query(and(author(ssb.id, {dedicated: false})), toPullStream()),
          pull.take(1),
          pull.drain(),
        );
        // (2) votes prefix index needed as soon as threads load
        pull(
          ssb.db.query(and(votesFor('whatever')), toPullStream()),
          pull.take(1),
          pull.drain(),
        );
      }),
    );

    return {
      rawLogReversed() {
        return ssb.db.query(descending(), toPullStream());
      },

      selfPublicRoots(opts: {live?: boolean; old?: boolean}) {
        return ssb.db.query(
          and(
            author(ssb.id, {dedicated: true}),
            type('post'),
            isPublic(),
            isRoot(),
          ),
          opts.live ? liveOperator({old: opts.old}) : null,
          toPullStream(),
        );
      },

      selfPublicReplies(opts: {live?: boolean; old?: boolean}) {
        return ssb.db.query(
          and(
            author(ssb.id, {dedicated: true}),
            type('post'),
            isPublic(),
            not(isRoot()),
          ),
          opts.live ? liveOperator({old: opts.old}) : null,
          toPullStream(),
        );
      },

      selfPrivateRootIdsLive() {
        return pull(
          ssb.db.query(
            and(
              author(ssb.id, {dedicated: true}),
              type('post'),
              isPrivate(),
              isRoot(),
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
