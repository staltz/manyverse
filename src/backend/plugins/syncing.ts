/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Pushable = require('pull-pushable');
const Thenable = require('pull-thenable');
const sleep = require('delay');
const estimateProgress = require('estimate-progress');

type Response = {
  started: number;
  prog: number;
  bytes: number;
};

function response(started: number, progressIndexes: any): Response {
  const {start, current, target} = progressIndexes;
  const prog = (current - start) / (target - start);
  const bytes = current - start;
  return {started, prog, bytes};
}

export = {
  name: 'syncing',
  version: '1.0.0',
  manifest: {
    stream: 'source',
  },
  permissions: {
    master: {
      allow: ['stream'],
    },
  },
  init: function init(ssb: any) {
    return {
      stream: function stream() {
        const pushable = Pushable();
        const nextFeedMsg = Thenable(
          ssb.createFeedStream({reverse: false, old: false, live: true}),
        );
        (async () => {
          let progress: any;
          let started: number;
          let getEstimated: () => any;
          let period: number;

          while (true) {
            pushable.push({started: 0, prog: 1, bytes: 0});
            do {
              await nextFeedMsg;
              await sleep(32);
              progress = ssb.progress();
            } while (progress.indexes.current === progress.indexes.target);

            started = Date.now();
            getEstimated = estimateProgress(() => progress.indexes, 15, 0.85);
            progress = ssb.progress();

            period = 200;
            do {
              pushable.push(response(started, getEstimated()));
              await sleep(period);
              period = Math.min(period * 2, 1600);
              progress = ssb.progress();
            } while (progress.indexes.current < progress.indexes.target);
          }
        })();
        return pushable;
      },
    };
  },
};
