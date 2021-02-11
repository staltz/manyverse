/* Copyright (C) 2018-2021 The Manyverse Authors.
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

  db2migrate: {
    start: 'sync',
  },

  // Third-party
  deweirdProducer: {
    start: 'async',
    more: 'async',
    close: 'async',
  },
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
  blobsPurge: {
    start: 'sync',
    stop: 'sync',
    changes: 'source',
  },
  private: {
    publish: 'async',
    unbox: 'sync',
    read: 'source',
  },
  aboutSelf: {
    get: 'async',
    stream: 'source',
  },
  suggest: {
    profile: 'async',
  },
  query: {
    read: 'source',
  },
  threads: {
    public: 'source',
    publicSummary: 'source',
    publicUpdates: 'source',
    private: 'source',
    privateUpdates: 'source',
    profile: 'source',
    profileSummary: 'source',
    thread: 'source',
    threadUpdates: 'source',
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
  connUtilsBack: {
    persistentConnect: 'async',
    persistentDisconnect: 'async',
    isInDB: 'async',
  },
  dbUtils: {
    rawLogReversed: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
  },
  publishUtilsBack: {
    publish: 'async',
    publishAbout: 'async',
  },
  friendsUtils: {
    isPrivatelyBlockingStream: 'source',
  },
  keysUtils: {
    getMnemonic: 'sync',
  },
  settingsUtils: {
    read: 'sync',
    updateHops: 'sync',
    updateBlobsPurge: 'sync',
    updateShowFollows: 'sync',
    updateDetailedLogs: 'sync',
  },
  syncing: {
    migrating: 'source',
    indexing: 'source',
  },
  votes: {
    voterStream: 'source',
  },
};
