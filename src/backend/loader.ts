/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import os = require('os');
const path = require('path');
const rnBridge = require('rn-bridge');

const nodejsProjectDir = path.resolve(rnBridge.app.datadir(), 'nodejs-project');
os.homedir = () => nodejsProjectDir;
process.cwd = () => nodejsProjectDir;
process.env = process.env || {};
process.env.CHLORIDE_JS = 'yes'; // Use WebAssembly libsodium
require('./index');
