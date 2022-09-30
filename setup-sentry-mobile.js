// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import * as Sentry from '@sentry/react-native';
const path = require('path');
import FS from 'react-native-fs';
import versionName from './lib/frontend/versionName';

export default function setupSentryMobile() {
  const settingsFile = path.join(
    FS.DocumentDirectoryPath,
    '.ssb',
    'manyverse-settings.json',
  );

  FS.readFile(settingsFile, 'utf8').then(
    (json) => {
      if (!json) return;
      let settings = {};
      try {
        settings = JSON.parse(json);
      } catch (err) {
        return;
      }
      if (!settings.allowCrashReports) return;

      Sentry.init({
        dsn: 'https://f0ac0805d95145e9aeb98ecd42d3ed4b@o1400646.ingest.sentry.io/6730238',
        release: versionName,
        sendDefaultPii: false,
        beforeSend(event) {
          delete event.user;
          delete event.breadcrumbs;
          if (event.contexts?.device?.timezone) {
            delete event.contexts.device.timezone;
          }
          if (event.contexts?.culture) {
            delete event.contexts.culture;
          }
          event.tags = event.tags || {};
          event.tags.side = 'frontend';
          event.tags.platform = 'mobile';
          return event;
        },
        beforeBreadcrumb(breadcrumb) {
          return null;
        },
      });

      Sentry.setUser(null);
    },
    (err) => {
      console.log('Error loading settings file for allowCrashReports:');
      console.error(err);
    },
  );
}
