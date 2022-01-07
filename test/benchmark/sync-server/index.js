// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const path = require('path');
const SecretStack = require('secret-stack');
const makeConfig = require('ssb-config/inject');

const config = makeConfig('ssb', {
  path: path.join(__dirname, 'data'),
  blobs: {
    sympathy: 2,
  },
  logging: {
    level: 'info',
  },
  conn: {
    autostart: true,
  },
  lan: {
    legacy: false,
  },
  friends: {
    hops: 2,
  },
  connections: {
    incoming: {
      net: [{scope: 'private', transform: 'shs', port: 26831}],
    },
    outgoing: {
      net: [{transform: 'shs'}],
    },
  },
});

process.env.DEBUG = '*';

SecretStack({appKey: require('ssb-caps').shs})
  .use(require('ssb-master'))
  .use(require('ssb-logging'))
  .use(require('ssb-db'))
  .use(require('ssb-friends'))
  .use(require('ssb-ebt'))
  .use(require('ssb-replication-scheduler'))
  .use(require('ssb-blobs'))
  .use(require('ssb-lan'))
  .use(require('ssb-conn'))
  .call(null, config);
