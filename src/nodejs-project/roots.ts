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
const rootOpinion = require('patchcore/message/sync/root');

const getRoot = rootOpinion.create().message.sync.root;

function isRoot(msg: Msg): boolean {
  const msgHasRoot = typeof getRoot(msg) === 'string';
  return !msgHasRoot;
}

function init(ssb: any, config: any) {
  return {
    read: function read(opts: any) {
      return pull(
        ssb.createFeedStream(opts),
        pull.filter(isRoot)
      );
    },
  };
}

export = {
  name: 'roots',
  version : '1.0.0',
  manifest : {
    read: 'source',
  },
  permissions : {
    master: {allow: ['read']}
  },
  init,
};
