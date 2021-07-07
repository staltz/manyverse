/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//import os = require('os');
//import path = require('path');
const {BrowserWindow, app, shell} = require('electron');

process.env = process.env ?? {};

// Set default directories
process.env.APP_DATA_DIR = process.cwd();
// TODO: go back to .ssb by default when we have better backwards compat
// between db1 and db2
process.env.SSB_DIR = process.env.SSB_DIR ?? '/tmp/ssb-temp'; //path.resolve(os.homedir(), '.ssb');

// Set global variables
process.env.MANYVERSE_PLATFORM = 'desktop';
// TODO: re-enable this for production
// if (fs.existsSync(path.join(process.env.SSB_DIR, 'DETAILED_LOGS'))) {
// process.env.DEBUG = '*';
process.env.DEBUG = 'ssb:*,jitdb,jitdb:*';
// }

let win: typeof BrowserWindow | null;

let resolveWebContents: ((wc: any) => void) | undefined;
// This will be used by multiserver to communicate with the frontend
(process as any).webContentsP = new Promise((resolve) => {
  resolveWebContents = resolve;
});

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('../index.html');

  if (resolveWebContents) resolveWebContents(win.webContents);
  win.webContents.openDevTools();

  // Handle external (web) links
  win.webContents.on('will-navigate', (ev: any, url: string) => {
    if (url !== ev.sender.getURL()) {
      ev.preventDefault();
      shell.openExternal(url);
    }
  });

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return;

  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

require('./index');
