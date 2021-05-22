/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface Channel {
  addListener(type: string, fn: (msg: string) => void): void;
  post(type: string, msg: string): void;
}
let channel: Channel;

if (process.env.MANYVERSE_PLATFORM === 'mobile') {
  const rnBridge = require('rn-bridge');
  channel = {
    addListener(type, fn) {
      rnBridge.channel.on(type, fn);
    },
    post(type, msg) {
      rnBridge.channel.post(type, msg);
    },
  };
} else {
  const {ipcMain} = require('electron');
  const webContentsPromise = (process as any).webContentsP as Promise<any>;
  let webContents: {send: CallableFunction} | null = null;
  channel = {
    addListener(type, fn) {
      ipcMain.addListener(type, (first: any, second: any) => {
        const msg = second ?? first;
        fn(msg);
      });
    },
    post(type, msg) {
      if (webContents) {
        webContents.send(type, msg);
      } else {
        webContentsPromise.then((wc: any) => {
          webContents = wc;
          webContents!.send(type, msg);
        });
      }
    },
  };
}

// Setup initial communication with the frontend, to create or restore identity
channel.addListener('identity', (request) => {
  const startSSB = () => require('./ssb');
  let response;
  if (request === 'CREATE' || request === 'USE') {
    startSSB();
    response = 'IDENTITY_READY';
  } else if (request.startsWith('RESTORE:')) {
    const words = request.split('RESTORE: ')[1].trim();
    const restore = require('./restore');
    response = restore(words);
    if (response === 'IDENTITY_READY') startSSB();
  }
  channel.post('identity', response);
});
