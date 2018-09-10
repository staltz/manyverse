/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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

function init(sbot: any) {
  return {
    stream: function stream() {
      const pushable = Pushable();
      const nextFeedMsg = Thenable(
        sbot.createFeedStream({reverse: false, old: false, live: true}),
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
            progress = sbot.progress();
          } while (progress.indexes.current === progress.indexes.target);

          started = Date.now();
          getEstimated = estimateProgress(() => progress.indexes, 15, 0.85);
          progress = sbot.progress();

          period = 200;
          do {
            pushable.push(response(started, getEstimated()));
            await sleep(period);
            period = Math.min(period * 2, 1600);
            progress = sbot.progress();
          } while (progress.indexes.current < progress.indexes.target);
        }
      })();
      return pushable;
    },
  };
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
  init,
};
