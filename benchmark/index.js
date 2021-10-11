// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const wd = require('wd');
const path = require('path');
const test = require('tape');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const localServerConfig = {host: 'localhost', port: 4995};

const str =
  '../android/app/build/outputs/apk/indie/release/app-indie-release-e2e.apk';
const localCapabilities = {
  browserName: 'Android - local server',
  platformName: 'Android',
  deviceName: 'Android device',
  autoGrantPermissions: true,
  app: path.resolve(__dirname, str),
};

test('Setup and open Android app', async function (t) {
  try {
    await exec('adb uninstall se.manyver');
  } catch (err) {}
  t.pass('Uninstalled existing se.manyver');

  var serverConfig = localServerConfig;
  var capabilities = localCapabilities;

  driver = wd.promiseChainRemote(serverConfig);
  driver
    .init(capabilities)
    .setImplicitWaitTimeout(1000)
    .then(() => {
      t.end();
    });
});

test(`Benchmark`, function (t) {
  require('./initial-sync.js')(driver, t);
  t.end();
});

test('Teardown', function (t) {
  driver.quit().then(() => {
    t.end();
  });
});
