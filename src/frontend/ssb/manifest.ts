/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default {
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

  // SSB SERVER
  plugins: {
    install: 'source',
    uninstall: 'source',
    enable: 'async',
    disable: 'async',
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
    hopStream: 'source',
    onEdge: 'sync',
    isFollowing: 'async',
    isBlocking: 'async',
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
    socialValue: 'async',
    latestValue: 'async',
    socialValues: 'async',
    latestValues: 'async',
    socialValueStream: 'source',
    socialValuesStream: 'source',
    latestValueStream: 'source',
    read: 'source',
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
    remove: 'async',
    hostingInvites: 'source',
  },
  bluetooth: {
    nearbyScuttlebuttDevices: 'source',
    bluetoothScanState: 'source',
    makeDeviceDiscoverable: 'async',
    isEnabled: 'async',
  },
  conn: {
    remember: 'sync',
    forget: 'sync',
    dbPeers: 'sync',
    connect: 'async',
    disconnect: 'async',
    peers: 'source',
    stage: 'sync',
    unstage: 'sync',
    stagedPeers: 'source',
    start: 'sync',
    stop: 'sync',
    ping: 'duplex',
  },
  tunnel: {
    announce: 'sync',
    leave: 'sync',
    isRoom: 'async',
    connect: 'duplex',
    endpoints: 'source',
    ping: 'sync',
  },

  // This project's plugins
  blobsUtils: {
    addFromPath: 'async',
  },
  connUtils: {
    persistentConnect: 'async',
    persistentDisconnect: 'async',
    isInDB: 'async',
  },
  feedUtilsBack: {
    publish: 'async',
    publishAbout: 'async',
  },
  friendsUtils: {
    isPrivatelyBlockingStream: 'source',
  },
  keysUtils: {
    getMnemonic: 'sync',
  },
  syncing: {
    stream: 'source',
  },
  votes: {
    voterStream: 'source',
  },
};
