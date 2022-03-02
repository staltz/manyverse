// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const wd = require('wd');
const test = require('tape');
const pkgJSON = require('../../../package.json');

const capabilities = {
  'browserstack.user': process.env.MANYVERSE_BROWSERSTACK_USER,
  'browserstack.key': process.env.MANYVERSE_BROWSERSTACK_KEY,
  'browserstack.debug': true,
  build: `Android ${pkgJSON.version}`,
  name: 'Smoke test',
  device: 'Google Pixel 3',
  automationName: 'UiAutomator2',
  fullReset: true,
  appWaitForLaunch: true,
  app: JSON.parse(process.env.BROWSERSTACK_APP_URL).app_url,
};

let driver;

test('Setup and open Android app', (t) => {
  t.timeoutAfter(120e3);
  driver = wd.promiseChainRemote('http://hub-cloud.browserstack.com/wd/hub');
  driver
    .init(capabilities)
    .setImplicitWaitTimeout(1000)
    .then(() => {
      t.end();
    });
});

test('...', function (t) {
  require('./welcome.js')(driver, t);
  require('./central.js')(driver, t);
  t.end();
});

test('Teardown', function (t) {
  driver.quit().then(() => {
    t.end();
  });
});
