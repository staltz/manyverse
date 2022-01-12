// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {app, ipcMain} from 'electron';

ipcMain.handle('incoming-url-first', async (event: any) => {
  return process.argv.length > 1 ? process.argv[process.argv.length - 1] : null;
});

const webContentsPromise = (process as any).webContentsP as Promise<any>;
let webContents: {send: CallableFunction} | null = null;

// note: mac only event
app.on('open-url', (event: any, url: string) => {
  if (webContents) {
    webContents.send('incoming-url', url);
  } else {
    webContentsPromise.then((wc: any) => {
      webContents = wc;
      webContents!.send('incoming-url', url);
    });
  }
});
