// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import path = require('path');
import fs = require('fs');
const rimraf = require('rimraf');

if (!process.env.SSB_DIR) {
  throw new Error('misconfigured SSB_DIR in the backend');
}
const SSB_DIR = process.env.SSB_DIR;
const KEYS_PATH = path.join(SSB_DIR, 'secret');

// One-time fixes for special issues.
//
// Sometimes things go wrong in the database and we need to reset indexes or
// others to make the database work again, but only once. This file accounts for
// all those cases, and each of these "issues" refers to GitLab issue codes.

const ISSUE_1223 = path.join(SSB_DIR, 'issue1223');
if (!fs.existsSync(ISSUE_1223)) {
  rimraf.sync(path.join(SSB_DIR, 'db2'));
  fs.closeSync(fs.openSync(ISSUE_1223, 'w'));
}

const ISSUE_1328 = path.join(SSB_DIR, 'issue1328');
if (!fs.existsSync(ISSUE_1328)) {
  rimraf.sync(path.join(SSB_DIR, 'db2', 'indexes') + '/*.*');
  fs.closeSync(fs.openSync(ISSUE_1328, 'w'));
}

const ISSUE_1486 = path.join(SSB_DIR, 'issue1486');
if (!fs.existsSync(ISSUE_1486)) {
  rimraf.sync(path.join(SSB_DIR, 'db2', 'indexes') + '/!(*.*)');
  fs.closeSync(fs.openSync(ISSUE_1486, 'w'));
}

// Fix issue #1518:
if (fs.existsSync(KEYS_PATH) && fs.lstatSync(KEYS_PATH).isDirectory()) {
  const keysPathWrong = path.join(KEYS_PATH, 'secret');
  const keysPathTmp = path.join(SSB_DIR, 'tmpsecret');
  fs.renameSync(keysPathWrong, keysPathTmp);
  rimraf.sync(KEYS_PATH);
  fs.renameSync(keysPathTmp, KEYS_PATH);
}
