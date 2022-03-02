// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const wd = require('wd');
const path = require('path');
const test = require('tape');

const localServerConfig = {
  host: 'localhost',
  port: 4995,
};

const localCapabilities = {
  platformName: 'Android',
  deviceName: 'Android device',
  autoGrantPermissions: true,
  automationName: 'UiAutomator2',
  fullReset: true,
  appWaitForLaunch: true,
  app: path.resolve(
    __dirname,
    '..',
    '..',
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'indie',
    'release',
    'app-indie-release-e2e.apk',
  ),
};

let driver;

test('Setup and open Android app', (t) => {
  t.timeoutAfter(120e3);
  driver = wd.promiseChainRemote(localServerConfig);
  driver
    .init(localCapabilities)
    .setImplicitWaitTimeout(1000)
    .then(() => {
      setTimeout(t.end, 2000);
    });
});

test('...', (t) => {
  require('./welcome.js')(driver, t);
  require('./central.js')(driver, t);
  require('./connections.js')(driver, t);
  require('./compose.js')(driver, t);
  require('./drawer.js')(driver, t);
  require('./settings.js')(driver, t);
  require('./feed.js')(driver, t);
  require('./thread.js')(driver, t);
  require('./profile.js')(driver, t);
  t.end();
});

test('Teardown', function (t) {
  driver.quit().then(() => {
    t.end();
  });
});
