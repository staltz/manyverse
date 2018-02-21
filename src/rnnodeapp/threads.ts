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

import {Msg} from '../ssb/types';
const pull = require('pull-stream');
const cat = require('pull-cat');
const sort = require('ssb-sort');
const rootOpinion = require('patchcore/message/sync/root');

const getRoot = rootOpinion.create().message.sync.root;

function isRoot(msg: Msg): boolean {
  const msgHasRoot = typeof getRoot(msg) === 'string';
  return !msgHasRoot;
}

function isPublic(msg: Msg<any>): boolean {
  return !msg.value.content || typeof msg.value.content !== 'string';
}

type ThreadData = Array<Msg | null>;

function rootToThread(sbot: any, threadMaxSize: number) {
  return (root: Msg, cb: (err: any, thread: ThreadData) => void) => {
    let rootKey = root.key;
    sbot.get(rootKey, (err1: any, value: Msg['value']) => {
      if (err1) {
        console.error('could not get root message', rootKey);
        console.error(err1);
        return;
      }

      if (((value.content) as any).root) rootKey = (value.content as any).root;

      pull(
        cat([
          pull.values([root]),
          sbot.links({
            rel: 'root', dest: rootKey, values: true, keys: true, live: false
          }),
        ]),
        pull.take(threadMaxSize),
        pull.collect((err2: any, arr: ThreadData) => {
          sort(arr);
          cb(null, arr);
        })
      );
    });
  };
}

type Opts = {
  limit?: number;
  threadMaxSize?: number;
};

function init(ssb: any, config: any) {
  return {
    public: function _public(opts: Opts) {
      const maxThreads = opts.limit || Infinity;
      const threadMaxSize = opts.threadMaxSize || Infinity;
      return pull(
        ssb.createFeedStream({...opts, limit: undefined, live: false}),
        pull.filter(isRoot),
        pull.filter(isPublic),
        pull.asyncMap(rootToThread(ssb, threadMaxSize)),
        pull.take(maxThreads)
      );
    },
  };
}

export = {
  name: 'threads',
  version : '1.0.0',
  manifest : {
    public: 'source',
  },
  permissions : {
    master: {allow: ['public']}
  },
  init,
};
