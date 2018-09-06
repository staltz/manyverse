/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Palette} from '../app/global-styles/palette';
const pull = require('pull-stream');
const Notification = require('react-native-android-local-notification');

const NOTIFICATION_ID = 175942; // only used in this module

type Response = {
  started: number;
  prog: number;
  bytes: number;
};

function showNotification(data: Response) {
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
  Notification.create({
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
    color: Palette.brand.background,
    category: 'progress',
    autoClear: true,
  });
}

function hideNotification() {
  Notification.clear(NOTIFICATION_ID);
}

export function startSyncingNotifications(syncingStream: any) {
  let showing = false;
  pull(
    syncingStream,
    pull.drain((response: Response) => {
      if (response.started > 0 && Date.now() - response.started > 3000) {
        showNotification(response);
        showing = true;
      } else if (response.started === 0 && showing) {
        hideNotification();
        showing = false;
      }
    }),
  );
}
