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

module.exports = {
  auth: 'async',
  address: 'sync',
  manifest: 'sync',
  get: 'async',
  createFeedStream: 'source',
  createLogStream: 'source',
  messagesByType: 'source',
  createHistoryStream: 'source',
  createUserStream: 'source',
  links: 'source',
  relatedMessages: 'async',
  add: 'async',
  publish: 'async',
  getAddress: 'sync',
  getLatest: 'async',
  latest: 'source',
  latestSequence: 'async',
  whoami: 'sync',
  usage: 'sync',
  plugins: {
    install: 'source',
    uninstall: 'source',
    enable: 'async',
    disable: 'async',
  },
  gossip: {
    peers: 'sync',
    add: 'sync',
    remove: 'sync',
    ping: 'duplex',
    connect: 'async',
    changes: 'source',
    reconnect: 'sync',
  },
  friends: {
    get: 'async',
    createFriendStream: 'source',
    hops: 'async',
    stream: 'source',
  },
  replicate: {
    changes: 'source',
    upto: 'source',
  },
  blobs: {
    get: 'source',
    getSlice: 'source',
    add: 'sink',
    rm: 'async',
    ls: 'source',
    has: 'async',
    size: 'async',
    meta: 'async',
    want: 'async',
    push: 'async',
    changes: 'source',
    createWants: 'source',
  },
  backlinks: {
    read: 'source',
  },
  about: {
    stream: 'source',
    get: 'async',
  },
  contacts: {
    stream: 'source',
    get: 'async',
  },
  query: {
    read: 'source',
  },
  invite: {
    create: 'async',
    accept: 'async',
    use: 'async',
  },
  block: {
    isBlocked: 'sync',
  },
  private: {
    publish: 'async',
    unbox: 'sync',
    read: 'source',
  },
};
