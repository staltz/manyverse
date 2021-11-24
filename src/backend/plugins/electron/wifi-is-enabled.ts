// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

const {ipcMain} = require('electron');
import os = require('os');
const ip = require('ip');

function wifiIsEnabled() {
  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    if (
      name.startsWith('eth') ||
      name.startsWith('wlan') ||
      name.startsWith('en') ||
      name.startsWith('wl')
    ) {
      if (addresses.some((a) => !a.internal && ip.isPrivate(a.address))) {
        return true;
      }
    }
  }
  return false;
}

ipcMain.on('call-wifiIsEnabled', (event: any, arg: any) => {
  event.returnValue = wifiIsEnabled();
});
