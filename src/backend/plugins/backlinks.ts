// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

//import {Msg, FeedId} from 'ssb-typescript';
const pull = require('pull-stream');
const ref = require('ssb-ref');
const {where, and, type, live, toPullStream} = require('ssb-db2/operators');
//import {Readable} from './helpers/types';

//function collectUniqueAuthors() {
//  const theMap: Map<FeedId, string> = new Map();
//  return function sink(read: Readable<Msg>) {
//    const outputSource: Readable<Array<[FeedId, string]>> = (abort, cb) => {
//      read(abort, function next(endOrErr, msg) {
//        if (endOrErr) {
//          cb(endOrErr);
//          return;
//        }
//        if (
//          !msg ||
//          (msg as any).sync ||
//          !msg.value?.content ||
//          msg.value.content.type !== 'vote' ||
//          !msg.value.content.vote
//        ) {
//          read(abort, next);
//          return;
//        }
//
//        const author = msg.value.author;
//        const voteValue = msg.value.content.vote.value;
//        const voteExpression =
//          msg.value.content.vote.expression ?? THUMBS_UP_UNICODE;
//        if (voteValue < 1 && theMap.has(author)) {
//          theMap.delete(author);
//        } else if (voteValue >= 1) {
//          // this delete is used on purpose, to reset the insertion order
//          theMap.delete(author);
//          theMap.set(author, voteExpression);
//        } else {
//          read(abort, next);
//          return;
//        }
//        cb(endOrErr, [...theMap]);
//      });
//    };
//    return outputSource;
//  };
//}

export = {
  name: 'backlinks',
  version: '1.0.0',
  manifest: {
    backlinkStream: 'source',
  },
  permissions: {
    master: {
      allow: ['backlinkStream'],
    },
  },
  init: function init(ssb: any) {
    const {fullMentions} = ssb.db.operators;

    return {
      backlinkStream: function backlinkStream(msgId: string) {
        if (!ref.isLink(msgId))
          throw new Error('A message id must be specified');
        return pull(
          ssb.db.query(
            where(and(type('post'), fullMentions(msgId))),
            live({old: true}),
            toPullStream(),
          ),
          //collectUniqueAuthors(),
        );
      },
    };
  },
};
