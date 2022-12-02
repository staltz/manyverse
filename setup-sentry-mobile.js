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
        beforeSend(ev) {
          delete ev.user;
          delete ev.breadcrumbs;
          if (ev.contexts?.culture) delete ev.contexts.culture;
          if (ev.contexts?.device?.timezone) delete ev.contexts.device.timezone;
          if (ev.contexts?.device?.language) delete ev.contexts.device.language;
          if (ev.contexts?.device?.locale) delete ev.contexts.device.locale;
          ev.tags = ev.tags || {};
          ev.tags.side = 'frontend';
          ev.tags.platform = 'mobile';
          return ev;
        },
        beforeBreadcrumb(breadcrumb) {
          return null;
        },
      });

      Sentry.setUser(null);
    },
    (err) => {
      if (err.code !== 'ENOENT') {
        console.log('Error loading settings file for allowCrashReports:');
        console.error(err);
      }
    },
  );
}
