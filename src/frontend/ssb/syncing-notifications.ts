/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Palette} from '../global-styles/palette';
const Thenable = require('pull-thenable');
const Notification = require('react-native-android-local-notification');

const NOTIFICATION_ID = 1984; // magic number used only in this file

type Response = {
  started: number;
  prog: number;
  bytes: number;
};

function showNotification(data: Response): Promise<void> {
  const progress = data.prog;
  const downloadedBytes = data.bytes;
  // tslint:disable-next-line:no-bitwise
  const downloadedKB = downloadedBytes >> 10;
  // tslint:disable-next-line:no-bitwise
  const downloadedMB = downloadedKB >> 10;
  // tslint:disable-next-line:no-bitwise
  const downloadedGB = downloadedMB >> 10;
  let message: string;
  if (downloadedMB > 1024) message = `${downloadedGB} GB synced so far`;
  else if (downloadedKB > 1024) message = `${downloadedMB} MB synced so far`;
  else if (downloadedBytes > 1024) message = `${downloadedKB} KB synced so far`;
  else message = `${downloadedBytes} bytes synced so far`;
  return Notification.create({
    id: NOTIFICATION_ID,
    subject: 'Syncing',
    message,
    localOnly: true,
    priority: 0,
    smallIcon: 'outline',
    onlyAlertOnce: true,
    progress,
    sound: null,
    vibrate: null,
    lights: null,
    color: Palette.backgroundBrand,
    category: 'progress',
    autoClear: true,
  });
}

function hideNotification(): Promise<void> {
  return Notification.clear(NOTIFICATION_ID);
}

export async function startSyncingNotifications(syncingStream: any) {
  let showing = false;
  const nextSyncingResponse = Thenable(syncingStream);
  while (true) {
    const response = await nextSyncingResponse;
    if (response.started > 0 && Date.now() - response.started > 3000) {
      await showNotification(response);
      showing = true;
    } else if (response.started === 0 && showing) {
      await hideNotification();
      showing = false;
    }
  }
}
