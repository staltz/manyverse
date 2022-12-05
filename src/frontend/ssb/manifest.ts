// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
  invite: {
    create: 'async',
    accept: 'async',
    use: 'async',
  },
  block: {
    isBlocked: 'sync',
  },

  db: {
    indexingProgress: 'source',
    compactionProgress: 'source',
    compact: 'async',
    reset: 'async',
  },
  db2migrate: {
    start: 'sync',
    stop: 'sync',
    progress: 'source',
  },

  // Third-party
  deweirdProducer: {
    start: 'async',
    more: 'async',
    close: 'async',
  },
  friends: {
    isFollowing: 'async',
    isBlocking: 'async',
    follow: 'async',
    block: 'async',
    hops: 'async',
    hopStream: 'source',
    graph: 'async',
    graphStream: 'source',
  },
  ebt: {
    replicate: 'duplex',
    replicateFormat: 'duplex',
    request: 'sync',
    block: 'sync',
    peerStatus: 'sync',
    clock: 'async',
  },
  replicationScheduler: {
    start: 'sync',
    reconfigure: 'sync',
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
  blobsBlurhash: {
    generate: 'async',
  },
  blobsPurge: {
    start: 'sync',
    stop: 'sync',
    changes: 'source',
  },
  friendsPurge: {
    start: 'sync',
    stop: 'sync',
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
    start: 'sync',
    profile: 'async',
  },
  query: {
    read: 'source',
  },
  threads: {
    public: 'source',
    publicSummary: 'source',
    publicUpdates: 'source',
    hashtagCount: 'async',
    hashtagSummary: 'source',
    hashtagUpdates: 'source',
    private: 'source',
    privateUpdates: 'source',
    profile: 'source',
    profileSummary: 'source',
    thread: 'source',
    threadUpdates: 'source',
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
  connFirewall: {
    attempts: 'source',
    reconfigure: 'sync',
  },
  roomClient: {
    consumeAliasUri: 'async',
    registerAlias: 'async',
    revokeAlias: 'async',
  },
  httpAuthClient: {
    produceSignInWebUrl: 'async',
    consumeSignInSsbUri: 'async',
    invalidateAllSessions: 'async',
  },
  httpInviteClient: {
    claim: 'async',
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
  aliasUtils: {
    get: 'async',
    stream: 'source',
  },
  connUtils: {
    persistentConnect: 'async',
    persistentDisconnect: 'async',
    peers: 'source',
    stagedPeers: 'source',
  },
  dbUtils: {
    warmUpJITDB: 'async',
    rawLogReversed: 'source',
    mentionsMe: 'source',
    postsCount: 'async',
    preferredReactions: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
    selfPrivateRootIdsLive: 'source',
    friendsInCommon: 'async',
    snapshotAbout: 'async',
    hashtagsSubscribed: 'source',
  },
  gatheringsUtils: {
    gatheringAttendees: 'source',
    gatheringInfo: 'async',
  },
  publishUtilsBack: {
    publish: 'async',
    publishAbout: 'async',
  },
  keysUtils: {
    getMnemonic: 'sync',
  },
  searchUtils: {
    query: 'source',
  },
  settingsUtils: {
    read: 'sync',
    updateHops: 'sync',
    updateBlobsPurge: 'sync',
    updateShowFollows: 'sync',
    updateDetailedLogs: 'sync',
    updateAllowCheckingNewVersion: 'sync',
    updateEnableFirewall: 'sync',
    updateAllowCrashReports: 'sync',
  },
  storageUsed: {
    getBytesStored: 'async',
    stats: 'async',
    stream: 'source',
  },
  resyncUtils: {
    progress: 'source',
    enableFirewall: 'sync',
  },
  syncing: {
    migrating: 'source',
    indexing: 'source',
  },
  votes: {
    voterStream: 'source',
  },
};
