// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import WT = require('worker_threads');
import settingsUtils = require('./plugins/settingsUtils');
import identity = require('./identity');
const {restore, migrate, clear} = identity;
import startSSB = require('./ssb');
const versionName = require('./versionName');
const {Worker, isMainThread, parentPort} = WT;

(process as any)._sentryEnabled =
  settingsUtils.readSync().allowCrashReports === true;

// Install Desktop backend plugins on the main thread
if (process.env.MANYVERSE_PLATFORM === 'desktop' && isMainThread) {
  require('./plugins/electron/win-blur-focus');
  require('./plugins/electron/wifi-is-enabled');
  require('./plugins/electron/incoming-urls');
  require('./plugins/electron/context-menu');
}

function setupSentryNodejs(platform: 'mobile' | 'desktop') {
  // Sentry nodejs-mobile is loaded here, not in the loader, because
  // loader.mobile.ts CANNOT import node_modules such as @sentry/node.
  const Sentry: typeof import('@sentry/electron') = require('@sentry/node');
  Sentry.init({
    dsn: 'https://f0ac0805d95145e9aeb98ecd42d3ed4b@o1400646.ingest.sentry.io/6730238',
    release: versionName,
    beforeSend(event) {
      if (!(process as any)._sentryEnabled) return null;
      delete event.user;
      delete event.breadcrumbs;
      if (event.tags?.server_name) delete event.tags.server_name;
      event.tags ??= {};
      event.tags.side = 'backend';
      event.tags.platform = platform;
      return event;
    },
  });
}

interface Frontend {
  addListener(type: string, fn: (msg: string) => void): void;
  send(type: string, msg: string): void;
}
let frontend: Frontend;

function prepareMobileThread() {
  // Sentry nodejs-mobile is loaded here, not in the loader, because
  // loader.mobile.ts CANNOT import node_modules such as @sentry/node.
  setupSentryNodejs('mobile');

  const rnBridge = require('rn-bridge');
  frontend = {
    addListener(type, fn) {
      rnBridge.channel.on(type, fn);
    },
    send(type, msg) {
      rnBridge.channel.post(type, msg);
    },
  };

  setupIdentityThenSSB();
}

function prepareDesktopWorkerThread() {
  // Sentry is setup here because its reporting system is different to the
  // electron main thread's system, and Worker is spawned on this file.
  setupSentryNodejs('desktop');

  frontend = {
    addListener(channel, fn) {
      parentPort!.on('message', (msg) => {
        if (msg.channel === channel) fn(msg.value);
      });
    },
    send(channel, value) {
      parentPort!.postMessage({channel, value: value});
    },
  };

  setupIdentityThenSSB();
}

function prepareDesktopMainThread() {
  const {ipcMain} = require('electron');

  const webContentsPromise = (process as any).webContentsP as Promise<any>;
  let webContents: {send: CallableFunction} | null = null;
  function sendToWebContents(channel: string, value: any) {
    if (webContents) {
      webContents.send(channel, value);
    } else {
      webContentsPromise.then((wc: NonNullable<typeof webContents>) => {
        webContents = wc;
        webContents.send(channel, value);
      });
    }
  }

  const worker = new Worker(__filename, {env: WT.SHARE_ENV});
  worker.on('message', (msg) => {
    if (msg.channel) {
      sendToWebContents(msg.channel, msg.value);
    } else {
      sendToWebContents('pull-electron-ipc-renderer', msg);
    }
  });
  worker.on('error', (err) => {
    throw err;
  });
  worker.on('exit', (code) => {
    console.log('worker exited with code ' + code);
  });
  ipcMain.addListener('identity', (first: any, second: any) => {
    const msg = second ?? first;
    worker.postMessage({channel: 'identity', value: msg});
  });
  ipcMain.addListener('pull-electron-ipc-main', (first: any, second: any) => {
    const msg = second ?? first;
    worker.postMessage(msg);
  });
}

// Setup initial communication with the frontend, to create or restore identity
function setupIdentityThenSSB() {
  let startedSSB = false;
  frontend.addListener('identity', (request) => {
    if (request === 'CREATE' && !startedSSB) {
      startedSSB = true;
      startSSB(true);
      frontend.send('identity', 'IDENTITY_READY');
    } else if (request === 'USE' && !startedSSB) {
      startedSSB = true;
      startSSB(false);
      frontend.send('identity', 'IDENTITY_READY');
    } else if (request.startsWith('RESTORE:') && !startedSSB) {
      const words = request.split('RESTORE: ')[1].trim();
      const response = restore(words);
      if (response === 'IDENTITY_READY') {
        startedSSB = true;
        startSSB(false);
      }
      frontend.send('identity', response);
    } else if (request === 'MIGRATE' && !startedSSB) {
      migrate(() => {
        startedSSB = true;
        startSSB(false);
        frontend.send('identity', 'IDENTITY_READY');
      });
    } else if (request === 'CLEAR' && startedSSB) {
      startedSSB = false;
      frontend.send('identity', 'IDENTITY_CLEARED');
      (process as any)._ssb.close(true, () => {
        clear(() => {
          (process as any)._ssb = null;
        });
      });
    }
  });
}

// Setup Channel
if (process.env.MANYVERSE_PLATFORM === 'mobile') {
  prepareMobileThread();
} else if (isMainThread) {
  prepareDesktopMainThread();
} else {
  prepareDesktopWorkerThread();
}
