// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import os = require('os');
import path = require('path');
import url = require('url');
import fs = require('fs');
import {BrowserWindow, app, ipcMain, shell} from 'electron';
const electronWindowState = require('electron-window-state');

process.env = process.env ?? {};

// Set default directories
app.setPath('userData', path.join(app.getPath('appData'), 'manyverse'));
process.env.APP_DATA_DIR = app.getAppPath();
process.env.APP_TMP_DIR = app.getPath('temp');
process.env.SHARED_SSB_DIR = path.resolve(os.homedir(), '.ssb');
process.env.SSB_DIR =
  process.env.SSB_DIR ?? path.resolve(app.getPath('userData'), 'ssb');

// Set global variables
process.env.MANYVERSE_PLATFORM = 'desktop';
if (fs.existsSync(path.join(process.env.SSB_DIR, 'DETAILED_LOGS'))) {
  process.env.DEBUG = '*';
}

let win: BrowserWindow | null;

let resolveWebContents: ((wc: any) => void) | undefined;
// This will be used by multiserver to communicate with the frontend
(process as any).webContentsP = new Promise((resolve) => {
  resolveWebContents = resolve;
});

function createWindow() {
  let windowState = electronWindowState({
    defaultWidth: 1024,
    defaultHeight: 720,
  });

  win = new BrowserWindow({
    title: 'Manyverse',
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    autoHideMenuBar: true,
    backgroundColor: '#4263eb', // brandMain
    webPreferences: {
      nodeIntegration: true,
      // TODO should be true, but supporting muxrpc would be much much harder:
      contextIsolation: false,
    },
  });
  win.setMinimumSize(700, 380);
  windowState.manage(win);

  win.loadURL(
    url.pathToFileURL(path.join(app.getAppPath(), 'index.html')).toString(),
  );

  if (resolveWebContents) resolveWebContents(win.webContents);

  if (process.env.MANYVERSE_DEVELOPMENT) {
    win.webContents.openDevTools({activate: false, mode: 'detach'});
  }

  // Handle external (web) links
  win.webContents.on('will-navigate', (ev: any, url: string) => {
    if (url !== ev.sender.getURL()) {
      ev.preventDefault();
      shell.openExternal(url);
    }
  });

  win.on('app-command', (e, cmd) => {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === 'browser-backward' && win) {
      win.webContents.send('mouse-back-press', null);
    }
  });

  win.webContents.on('new-window', (ev: any, url: string) => {
    ev.preventDefault();
    // open the url in the default system browser
    shell.openExternal(url);
  });

  win.on('closed', () => {
    win = null;
  });
}

// Useful for cases like defininig the Electron "userData" directory
app.setName('manyverse');

if ((process as any).defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('ssb', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('ssb');
}

const hasLock = app.requestSingleInstanceLock();

if (!hasLock) {
  app.quit();
} else {
  app.on(
    'second-instance',
    (ev: any, argv: Array<string>, cwd: any, extraData: any) => {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
        if (argv.length > 1)
          win.webContents.send('incoming-url', argv[argv.length - 1]);
      }
    },
  );

  app.whenReady().then(() => {
    createWindow();
  });

  app.on('window-all-closed', () => {
    ipcMain.emit('pull-electron-ipc-close', null);
    if ((process as any)._ssb) {
      (process as any)._ssb.close(true, () => {
        app.quit();
      });
    } else {
      app.quit();
    }
  });

  require('./index');
}
