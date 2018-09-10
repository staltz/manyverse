/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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

const wd = require('wd');
const path = require('path');
const test = require('tape');

const localServerConfig = {host: 'localhost', port: 4995};

const str = '../android/app/build/outputs/apk/release/app-release.apk';
const localCapabilities = {
  browserName: 'Android - local server',
  platformName: 'Android',
  deviceName: 'Android device',
  app: path.resolve(__dirname, str),
};

let driver;

test('Setup and open Android app', function(t) {
  var serverConfig = localServerConfig;
  var capabilities = localCapabilities;

  driver = wd.promiseChainRemote(serverConfig);
  driver.init(capabilities).setImplicitWaitTimeout(1000).then(() => {
    t.end();
  });
});

test('...', function(t) {
  require('./central.js')(driver, t);
  require('./connections.js')(driver, t);
  require('./compose.js')(driver, t);
  require('./drawer.js')(driver, t);
  require('./feed.js')(driver, t);
  require('./thread.js')(driver, t);
  require('./profile.js')(driver, t);
  t.end();
});

test('Teardown', function(t) {
  driver.quit().then(() => {
    t.end();
  });
});
