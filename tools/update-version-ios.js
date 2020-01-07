#!/usr/bin/env node

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

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
  .catch(err => {
    done();
    console.error(err);
    process.exit(1);
  });

function done() {
  pkgJSON.version = version;
  fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, null, 2));
}
