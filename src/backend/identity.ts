// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import fs = require('fs');
import path = require('path');
const Mnemonic = require('ssb-keys-mnemonic');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
import {Callback} from './plugins/helpers/types';

function fileSize(filename: string) {
  try {
    const stats = fs.statSync(filename);
    return stats.size;
  } catch (err) {
    if (err.code === 'ENOENT') return 0;
    else throw err;
  }
}

export function restore(words: string) {
  // Check if there is another mature account
  if (!fs.existsSync(process.env.SSB_DIR!)) mkdirp.sync(process.env.SSB_DIR);
  const oldLogPath = path.join(process.env.SSB_DIR!, 'flume', 'log.offset');
  const oldLogSize = fileSize(oldLogPath);
  if (oldLogSize >= 10) return 'OVERWRITE_RISK';
  const newLogPath = path.join(process.env.SSB_DIR!, 'db2', 'log.bipf');
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
  const secretPath = path.join(process.env.SSB_DIR!, 'secret');
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
}

export function migrate(cb: Callback<void>) {
  if (process.env.MANYVERSE_PLATFORM !== 'desktop') {
    throw new Error('Cannot run identity.migrate() unless we are on desktop.');
  }
  if (!process.env.SHARED_SSB_DIR) {
    throw new Error('identity.migrate() is missing env var SHARED_SSB_DIR');
  }
  if (!process.env.MANYVERSE_SSB_DIR) {
    throw new Error('identity.migrate() is missing env var MANYVERSE_SSB_DIR');
  }

  const SHARED_SSB_DIR = process.env.SHARED_SSB_DIR;
  const MANYVERSE_SSB_DIR = process.env.MANYVERSE_SSB_DIR;
  mkdirp.sync(MANYVERSE_SSB_DIR);

  // Move blobs folder from ~/.ssb to manyverse folder
  fs.rename(
    path.join(SHARED_SSB_DIR, 'blobs'),
    path.join(MANYVERSE_SSB_DIR, 'blobs'),
    (err) => {
      if (err && err.code !== 'ENOENT') throw err;

      // Move flume log from ~/.ssb to manyverse folder
      mkdirp.sync(path.join(MANYVERSE_SSB_DIR, 'flume'));
      fs.rename(
        path.join(SHARED_SSB_DIR, 'flume', 'log.offset'),
        path.join(MANYVERSE_SSB_DIR, 'flume', 'log.offset'),
        (err) => {
          if (err) throw err;

          // Move all other files
          const files = [
            'blobs_push',
            'conn.json',
            'conn-attempts.json',
            'secret',
          ];
          for (const file of files) {
            try {
              fs.renameSync(
                path.join(SHARED_SSB_DIR, file),
                path.join(MANYVERSE_SSB_DIR, file),
              );
            } catch (err) {
              if (err.code !== 'ENOENT') throw err;
            }
          }

          // Delete old shared folder
          rimraf.sync(SHARED_SSB_DIR);

          cb();
        },
      );
    },
  );
}
