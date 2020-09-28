/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs = require('fs');
import path = require('path');
const rnBridge = require('rn-bridge');
const Mnemonic = require('ssb-keys-mnemonic');
const mkdirp = require('mkdirp');

function fileSize(filename: string) {
  try {
    const stats = fs.statSync(filename);
    return stats.size;
  } catch (err) {
    if (err.code === 'ENOENT') return 0;
    else throw err;
  }
}

module.exports = function restore(words: string) {
  // Check if there is another mature account
  const appDataDir = rnBridge.app.datadir();
  const ssbPath = path.join(appDataDir, '.ssb');
  if (!fs.existsSync(ssbPath)) mkdirp.sync(ssbPath);
  const flumeLogPath = path.join(ssbPath, 'flume', 'log.offset');
  const flumeLogSize = fileSize(flumeLogPath);
  if (flumeLogSize >= 10) return 'OVERWRITE_RISK';

  // Basic validation of input words
  const wordsArr = words.split(' ').map((s) => s.trim().toLowerCase());
  if (wordsArr.length < 24) return 'TOO_SHORT';
  if (wordsArr.length > 48) return 'TOO_LONG';

  // Convert words to keys
  let keys: any;
  try {
    keys = Mnemonic.wordsToKeys(wordsArr.join(' '));
  } catch (err) {
    if (err.message) {
      if (err.message.startsWith('invalid words')) {
        return 'INCORRECT';
      }
      if (err.message.startsWith('there should be 24 words')) {
        return 'WRONG_LENGTH';
      }
    }
    throw err;
  }

  // Overwrite `secret` with the newly restored keys
  const json = JSON.stringify(keys, null, 2);
  const secretPath = path.join(ssbPath, 'secret');
  try {
    if (fileSize(secretPath) >= 10) {
      fs.unlinkSync(secretPath);
    }
    const writeOpts = {mode: 0x100, flag: 'w'};
    fs.writeFileSync(secretPath, json, writeOpts);
  } catch (err) {
    throw err;
  }

  return 'IDENTITY_READY';
};
