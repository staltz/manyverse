/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import os = require('os');
import path = require('path');
import fs = require('fs');
import {BrowserWindow, app, WebContents} from 'electron';

process.env = process.env ?? {};

// Set default directories
process.env.APP_DATA_DIR = process.cwd();
process.env.SSB_DIR = path.resolve(os.homedir(), '.ssb');

// Set global variables
process.env.MANYVERSE_PLATFORM = 'desktop';
// process.env.PROFILER_NODEJS = 'yes'; // uncomment to enable the profiler
// if (fs.existsSync(path.join(process.env.SSB_DIR, 'DETAILED_LOGS'))) {
process.env.DEBUG = '*';
// }

let win: BrowserWindow | null;

let resolveWebContents: ((wc: WebContents) => void) | undefined;
// This will be used by multiserver to communicate with the frontend
(process as any).webContentsP = new Promise(resolve => {
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

// Profile Node.js CPU usage, output to the tmp dir
if (process.env.PROFILER_NODEJS) {
  const inspector = require('inspector');
  const session = new inspector.Session();
  session.connect();
  session.post('Profiler.enable', () => {
    session.post('Profiler.start', () => {
      require('./index');
      setTimeout(() => {
        session.post('Profiler.stop', (err: any, res: any) => {
          if (err) return console.error(err);
          const data = res.profile || res.result;
          const date = new Date();
          const dir = path.resolve(process.env.SSB_DIR!, 'manyverse');
          const file = `${dir}/flamechart_${date.getTime()}.json`;
          fs.writeFile(file, JSON.stringify(data), err2 => {
            if (err2) console.error(err2);
          });
        });
      }, 20e3);
    });
  });
} else {
  require('./index');
}
