/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pull = require('pull-stream');

export = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    rawLogReversed: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
  },
  permissions: {
    master: {
      allow: ['rawLogReversed', 'selfPublicRoots', 'selfPublicReplies'],
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
      descending,
      toPullStream,
    } = ssb.db.operators;

    // Query the non-dedicated author index, to eagerly build it since
    // it will be needed for all profile screens
    pull(
      ssb.db.query(and(author(ssb.id, {dedicated: false})), toPullStream()),
      pull.take(1),
      pull.drain(),
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
    };
  },
};
