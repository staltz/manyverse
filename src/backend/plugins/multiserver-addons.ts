/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const NoauthTransformPlugin = require('multiserver/plugins/noauth');
const WS = require('multiserver/plugins/ws');
const rnChannelPlugin = require('multiserver-rn-channel');
const electronIpcPlugin = require('multiserver-electron-ipc');

export = function multiserverAddons(ssb: any, cfg: any) {
  ssb.multiserver.transform({
    name: 'noauth',
    create: () =>
      NoauthTransformPlugin({
        keys: {publicKey: Buffer.from(cfg.keys.public, 'base64')},
      }),
  });

  ssb.multiserver.transport({
    name: 'ws',
    create: () => WS({}),
  });

  if (process.env.MANYVERSE_PLATFORM === 'mobile') {
    try {
      const rnBridge = require('rn-' + 'bridge'); // bypass noderify
      ssb.multiserver.transport({
        name: 'channel',
        create: () => rnChannelPlugin(rnBridge.channel),
      });
    } catch (err) {}
  } else {
    try {
      const {ipcMain} = require('electron');
      const webContentsPromise = (process as any).webContentsP;
      ssb.multiserver.transport({
        name: 'channel',
        create: () => electronIpcPlugin({ipcMain, webContentsPromise}),
      });
    } catch (err) {
      console.error(err);
    }
  }
};
