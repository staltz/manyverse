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

const delay = require('delay');
const estimateProgress = require('estimate-progress');
const Notification = require('react-native-android-local-notification');

const NOTIFICATION_ID = 175942; // only used in this module

type ProgressData = {
  start: number;
  current: number;
  target: number;
};

function showNotification(data: ProgressData) {
  const {start, current, target} = data;
  const progress = (current - start) / (target - start);
  const downloadedBytes = current - start;
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
    subject: 'MMMMM is syncing',
    message,
    localOnly: true,
    smallIcon: 'outline',
    onlyAlertOnce: true,
    progress,
    vibrate: null,
    autoClear: true,
  });
}

function hideNotification() {
  Notification.clear(NOTIFICATION_ID);
}

function getStatus(ssbClient: any) {
  return new Promise<any>((resolve, reject) => {
    ssbClient.status((err: any, status: any) => {
      if (err) reject(err);
      else resolve(status);
    });
  });
}

function isUpToDate(data: ProgressData) {
  return data.current === data.target;
}

export async function startSyncingNotifications(ssbClientPromise: any) {
  const ssbClient = await ssbClientPromise;
  let status: any;
  let getEstimated: () => ProgressData;
  while (true) {
    // Polling cycle
    do {
      await delay(1500);
      status = await getStatus(ssbClient);
    } while (isUpToDate(status.progress.indexes));

    // Rendering cycle
    getEstimated = estimateProgress(() => status.progress.indexes, 15, 0.85);
    do {
      showNotification(getEstimated());
      await delay(150);
      status = await getStatus(ssbClient);
    } while (!isUpToDate(getEstimated()));
    await delay(500);
    hideNotification();
  }
}
