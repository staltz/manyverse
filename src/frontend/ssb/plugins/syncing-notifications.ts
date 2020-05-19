/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform} from 'react-native';
import {ClientAPI} from 'react-native-ssb-client';
import {Palette} from '../../global-styles/palette';
import {t} from '../../drivers/localization';
import manifest from '../manifest';
const Thenable = require('pull-thenable');
const Notification = require('react-native-android-local-notification');

const NOTIFICATION_ID = 1984; // magic number used only in this file

type Response = {
  started: number;
  prog: number;
  bytes: number;
};

type SSB = ClientAPI<typeof manifest>;

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
  if (downloadedMB > 1024) {
    message = t('notifications.syncing.gigabytes', {gb: downloadedGB});
  } else if (downloadedKB > 1024) {
    message = t('notifications.syncing.megabytes', {mb: downloadedMB});
  } else if (downloadedBytes > 1024) {
    message = t('notifications.syncing.kilobytes', {kb: downloadedKB});
  } else {
    message = t('notifications.syncing.bytes', {b: downloadedBytes});
  }
  return Notification.create({
    id: NOTIFICATION_ID,
    subject: t('notifications.syncing.title'),
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

async function consume(syncingStream: any) {
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

export default function syncingNotifications() {
  return {
    name: 'notifications' as const,
    init: (ssb: SSB) => {
      if (Platform.OS === 'android') {
        consume(ssb.syncing.stream());
      }
      return {};
    },
  };
}
