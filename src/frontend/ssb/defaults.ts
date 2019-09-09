/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const os = require('os');
const path = require('path');

const ssbPath = path.join(os.homedir(), '.ssb');
export const ssbKeysPath = path.join(ssbPath, 'secret');
