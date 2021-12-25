// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {app, BrowserWindow} from 'electron';

const webContentsPromise = (process as any).webContentsP as Promise<any>;
let webContents: {send: CallableFunction} | null = null;

app.on('browser-window-blur', (event: any, win: BrowserWindow) => {
  if (webContents) {
    webContents.send('win-blur-focus', 'blur');
  } else {
    webContentsPromise.then((wc: any) => {
      webContents = wc;
      webContents!.send('win-blur-focus', 'blur');
    });
  }
});

app.on('browser-window-focus', (event: any, win: BrowserWindow) => {
  if (webContents) {
    webContents.send('win-blur-focus', 'focus');
  } else {
    webContentsPromise.then((wc: any) => {
      webContents = wc;
      webContents!.send('win-blur-focus', 'focus');
    });
  }
});
