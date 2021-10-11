// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import fs = require('fs');
import path = require('path');
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
  const ssbPath = path.join(process.env.APP_DATA_DIR!, '.ssb');
  if (!fs.existsSync(ssbPath)) mkdirp.sync(ssbPath);
  const oldLogPath = path.join(ssbPath, 'flume', 'log.offset');
  const oldLogSize = fileSize(oldLogPath);
  if (oldLogSize >= 10) return 'OVERWRITE_RISK';
  const newLogPath = path.join(ssbPath, 'db2', 'log.bipf');
  const newLogSize = fileSize(newLogPath);
  if (newLogSize >= 10) return 'OVERWRITE_RISK';

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
