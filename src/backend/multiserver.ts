/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const NoauthTransformPlugin = require('multiserver/plugins/noauth');
const rnChannelPlugin = require('multiserver-rn-channel');
const rnBridge = require('rn-bridge');
const WS = require('multiserver/plugins/ws');

export = function multiserverAddons(ssb: any, cfg: any) {
  ssb.multiserver.transform({
    name: 'noauth',
    create: () =>
      NoauthTransformPlugin({
        keys: {publicKey: Buffer.from(cfg.keys.public, 'base64')},
      }),
  });

  ssb.multiserver.transport({
    name: 'channel',
    create: () => rnChannelPlugin(rnBridge.channel),
  });

  ssb.multiserver.transport({
    name: 'ws',
    create: () => WS({}),
  });
};
