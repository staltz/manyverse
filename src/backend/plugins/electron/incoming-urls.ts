// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

const {app, ipcMain} = require('electron');

ipcMain.handle('incoming-url-first', async (event: any) => {
  return process.argv[1] ?? null;
});

const webContentsPromise = (process as any).webContentsP as Promise<any>;
let webContents: {send: CallableFunction} | null = null;

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
