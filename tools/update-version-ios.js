#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const ReactNativeVersion = require('react-native-version');
const path = require('path');
const fs = require('fs');

const pkgJSON = JSON.parse(fs.readFileSync('./package.json'));
const version = pkgJSON.version;

const versionIOS = version.split('-')[0];

pkgJSON.version = versionIOS;
fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, null, 2));
ReactNativeVersion.version(
  {
    neverAmend: true,
    target: ['ios'],
    legacy: true,
    setBuild: versionIOS,
  },
  path.resolve(__dirname, '../'),
)
  .then(done)
  .catch((err) => {
    done();
    console.error(err);
    process.exit(1);
  });

function done() {
  pkgJSON.version = version;
  fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, null, 2));
}
