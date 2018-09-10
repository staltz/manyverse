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

export = {
  // Secure Scuttlebutt
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
  status: 'sync',
  progress: 'sync',
  whoami: 'sync',
  usage: 'sync',

  // Scuttlebot
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
  replicate: {
    changes: 'source',
    upto: 'source',
  },
  invite: {
    create: 'async',
    accept: 'async',
    use: 'async',
  },
  block: {
    isBlocked: 'sync',
  },

  // Third-party
  friends: {
    get: 'async',
    createFriendStream: 'source',
    hops: 'async',
    stream: 'source',
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
  private: {
    publish: 'async',
    unbox: 'sync',
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
  threads: {
    public: 'source',
    publicUpdates: 'source',
    profile: 'source',
    thread: 'source',
  },
  dhtInvite: {
    start: 'async',
    create: 'async',
    use: 'async',
    accept: 'async',
    channels: 'source',
    hostingInvites: 'source',
    claimingInvites: 'source',
  },

  // This project's plugins
  syncing: {
    stream: 'source',
  },
};
