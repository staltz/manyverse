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

const pull = require('pull-stream');
const Read = require('pull-file');

function init(sbot: any) {
  if (!sbot.blobs || !sbot.blobs.add) {
    throw new Error('"blobsFromPath" is missing required plugin "ssb-blobs"');
  }

  return {
    add: function add(path: string, cb: (_e: any, _h?: string) => void) {
      pull(Read(path, {}), sbot.blobs.add(cb));
    },
  };
}

export = {
  name: 'blobsFromPath',
  version: '1.0.0',
  manifest: {
    add: 'async',
  },
  permissions: {
    master: {
      allow: ['add'],
    },
  },
  init,
};
