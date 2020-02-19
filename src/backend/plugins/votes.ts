/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Msg, FeedId} from 'ssb-typescript';
const pull = require('pull-stream');
const ref = require('ssb-ref');
import {Readable} from './helpers/types';

function collectUniqueAuthors() {
  const theSet: Set<FeedId> = new Set();
  return function sink(read: Readable<Msg>) {
    const outputSource: Readable<Array<FeedId>> = (abort, cb) => {
      read(abort, function next(endOrErr, msg) {
        if (endOrErr) {
          cb(endOrErr);
          return;
        }
        if (
          !msg ||
          (msg as any).sync ||
          !msg.value?.content ||
          msg.value.content.type !== 'vote' ||
          !msg.value.content.vote
        ) {
          read(abort, next);
          return;
        }

        const author = msg.value.author;
        const voteValue = msg.value.content.vote.value;
        if (voteValue < 1 && theSet.has(author)) {
          theSet.delete(author);
        } else if (voteValue >= 1 && !theSet.has(author)) {
          theSet.add(author);
        } else {
          read(abort, next);
          return;
        }
        cb(endOrErr, [...theSet]);
      });
    };
    return outputSource;
  };
}

export = {
  name: 'votes',
  version: '1.0.0',
  manifest: {
    voterStream: 'source',
  },
  permissions: {
    master: {
      allow: ['voterStream'],
    },
  },
  init: function init(ssb: any) {
    if (!ssb.backlinks || !ssb.backlinks.read) {
      throw new Error('"votes" is missing required plugin "ssb-backlinks"');
    }

    return {
      voterStream: function voterStream(msgId: string) {
        if (!ref.isLink(msgId))
          throw new Error('A message id must be specified');
        return pull(
          ssb.backlinks.read({
            query: [{$filter: {dest: msgId}}],
            index: 'DTA',
            live: true,
          }),
          collectUniqueAuthors(),
        );
      },
    };
  },
};
