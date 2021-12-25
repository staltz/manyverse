// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

// import os = require('os');
import path = require('path');
import url = require('url');
import fs = require('fs');
import {BrowserWindow, app, shell} from 'electron';

process.env = process.env ?? {};

// Set default directories
process.env.APP_DATA_DIR = app.getAppPath();
process.env.SSB_DIR = process.env.SSB_DIR ?? '/tmp/ssb-temp'; // path.resolve(os.homedir(), '.ssb');

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
  win = new BrowserWindow({
    title: 'Manyverse',
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    backgroundColor: '#4263eb', // brandMain
    webPreferences: {
      nodeIntegration: true,
      // TODO should be true, but supporting muxrpc would be much much harder:
      contextIsolation: false,
    },
  });
  win.setMinimumSize(640, 380);

  win.loadURL(
    url.pathToFileURL(path.join(app.getAppPath(), 'index.html')).toString(),
  );

  if (resolveWebContents) resolveWebContents(win.webContents);
  win.webContents.openDevTools({activate: false, mode: 'right'});

  // Handle external (web) links
  win.webContents.on('will-navigate', (ev: any, url: string) => {
    if (url !== ev.sender.getURL()) {
      ev.preventDefault();
      shell.openExternal(url);
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
        if (argv && argv[1]) win.webContents.send('incoming-url', argv[1]);
      }
    },
  );

  app.whenReady().then(() => {
    createWindow();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  require('./index');
}
