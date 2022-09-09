// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import identity = require('./identity');
const {restore, migrate, clear} = identity;
import startSSB = require('./ssb');

// Install Desktop backend plugins
if (process.env.MANYVERSE_PLATFORM === 'desktop') {
  require('./plugins/electron/win-blur-focus');
  require('./plugins/electron/wifi-is-enabled');
  require('./plugins/electron/incoming-urls');
  require('./plugins/electron/context-menu');
}

interface Channel {
  addListener(type: string, fn: (msg: string) => void): void;
  post(type: string, msg: string): void;
}
let channel: Channel;

// Setup Channel
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
let startedSSB = false;
channel.addListener('identity', (request) => {
  if (request === 'CREATE' && !startedSSB) {
    startedSSB = true;
    startSSB(true);
    channel.post('identity', 'IDENTITY_READY');
  } else if (request === 'USE' && !startedSSB) {
    startedSSB = true;
    startSSB(false);
    channel.post('identity', 'IDENTITY_READY');
  } else if (request.startsWith('RESTORE:') && !startedSSB) {
    const words = request.split('RESTORE: ')[1].trim();
    const response = restore(words);
    if (response === 'IDENTITY_READY') {
      startedSSB = true;
      startSSB(false);
    }
    channel.post('identity', response);
  } else if (request === 'MIGRATE' && !startedSSB) {
    migrate(() => {
      startedSSB = true;
      startSSB(false);
      channel.post('identity', 'IDENTITY_READY');
    });
  } else if (request === 'CLEAR' && startedSSB) {
    startedSSB = false;
    channel.post('identity', 'IDENTITY_CLEARED');
    (process as any)._ssb.close(true, () => {
      clear(() => {
        (process as any)._ssb = null;
      });
    });
  }
});
