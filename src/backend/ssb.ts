// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import fs = require('fs');
import path = require('path');
const mkdirp = require('mkdirp');
const caps = require('ssb-caps');
const ssbKeys = require('ssb-keys');
const makeConfig = require('ssb-config/inject');
const DEFAULT_SERVE_BLOBS_PORT = require('ssb-serve-blobs/port');
const SecretStack = require('secret-stack');
const getPort = require('get-port');
import settingsUtils = require('./plugins/settingsUtils');
import oneTimeFixes = require('./one-time-fixes');

type PortPurpose = 'ssb-serve-blobs';

type PortMappings = {
  [Purpose in PortPurpose]: number;
};

export = async function startSSB(
  isNewIdentity: boolean,
): Promise<{ports: PortMappings}> {
  // Make sure SSB_DIR exists
  if (!process.env.APP_DATA_DIR || !process.env.SSB_DIR) {
    throw new Error('misconfigured default paths for the backend');
  }
  if (!fs.existsSync(process.env.SSB_DIR)) mkdirp.sync(process.env.SSB_DIR);

  await oneTimeFixes();
  const KEYS_PATH = path.join(process.env.SSB_DIR!, 'secret');
  const keys = ssbKeys.loadOrCreateSync(KEYS_PATH);

  const serveBlobsPort = await getPort({port: DEFAULT_SERVE_BLOBS_PORT});

  const config = makeConfig('ssb', {
    caps,
    keys,
    path: process.env.SSB_DIR,
    db2: {
      maxCpu: 91, // %
      maxCpuWait: 80, // ms
      maxCpuMaxPause: 120, // ms
      automigrate: true,
      dangerouslyKillFlumeWhenMigrated: true,
      // For new users that have just created an identity, only try to decrypt
      // messages created recently (1 week ago) to speed up onboarding:
      startDecryptBox1: isNewIdentity
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        : null,
    },
    blobs: {
      sympathy: 2,
    },
    blobsPurge: {
      cpuMax: 90, // %
    },
    conn: {
      autostart: false,
      firewall: {
        rejectBlocked: true,
        rejectUnknown: true,
      },
    },
    friends: {
      hops: settingsUtils.readSync().hops ?? 2,
      hookAuth: false, // because we use ssb-conn-firewall
    },
    replicationScheduler: {
      autostart: false,
      partialReplication: null,
    },
    suggest: {
      autostart: false,
    },
    connections: {
      incoming: {
        net: [{scope: 'private', transform: 'shs', port: 26831}],
        channel: [{scope: 'device', transform: 'noauth'}],
        tunnel: [{scope: 'public', transform: 'shs'}],
      },
      outgoing: {
        net: [{transform: 'shs'}],
        ws: [{transform: 'shs'}],
        tunnel: [{transform: 'shs'}],
      },
    },
    serveBlobs: {
      port: serveBlobsPort,
    },
  });

  (process as any)._ssb = SecretStack()
    // Core
    .use(require('ssb-master'))
    .use(require('ssb-db2'))
    .use(require('ssb-db2/compat/db'))
    .use(require('ssb-db2/compat/ebt'))
    .use(require('ssb-db2/compat/log-stream'))
    .use(require('ssb-db2/compat/history-stream'))
    .use(require('ssb-deweird/producer'))
    // Replication
    .use(require('ssb-ebt')) // needs: db2/compat
    .use(require('ssb-friends')) // needs: db2
    .use(require('ssb-replication-scheduler')) // needs: friends, ebt
    // Connections
    .use(require('./plugins/multiserver-addons'))
    .use(require('ssb-lan'))
    .use(require('ssb-conn')) // needs: db2, friends, lan
    .use(require('ssb-conn-firewall')) // needs: friends
    .use(require('ssb-room-client')) // needs: conn
    .use(require('ssb-http-auth-client')) // needs: conn
    .use(require('ssb-http-invite-client'))
    .use(require('ssb-invite-client')) // needs: db2, conn
    // Queries
    .use(require('ssb-about-self')) // needs: db2
    .use(require('ssb-suggest-lite')) // needs: db2, about-self, friends
    .use(require('ssb-threads')) // needs: db, db2, friends
    .use(require('ssb-db2/full-mentions')) // needs: db2
    .use(require('ssb-search2')) // needs: db2
    // Blobs
    .use(require('ssb-blobs'))
    .use(require('ssb-serve-blobs')) // needs: blobs
    .use(require('ssb-blobs-blurhash')) // needs: blobs
    .use(require('ssb-blobs-purge')) // needs: blobs, db2/full-mentions
    // Storage
    .use(require('ssb-storage-used')) // needs: db2
    .use(require('ssb-friends-purge')) // needs: db2, friends
    // Customizations
    .use(require('./plugins/blobsUtils')) // needs: blobs
    .use(require('./plugins/connUtils')) // needs: conn, aboutSelf
    .use(require('./plugins/aliasUtils')) // needs: db2
    .use(require('./plugins/resyncUtils')) // needs: db2, connFirewall
    .use(require('./plugins/publishUtilsBack')) // needs: db, blobs, blobsUtils
    .use(require('./plugins/searchUtils')) // needs: db2
    .use(require('./plugins/gatheringsUtils')) // needs: db2
    .use(require('./plugins/keysUtils'))
    .use(settingsUtils) // needs: blobs-purge, conn-firewall
    .use(require('./plugins/dbUtils')) // needs: db2, syncing, friends
    .use(require('./plugins/votes')) // needs: db2
    .call(null, config);

  return {
    ports: {
      'ssb-serve-blobs': serveBlobsPort,
    },
  };
};
