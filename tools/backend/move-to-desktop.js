#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs-extra');
const rimraf = require('rimraf');

(async function () {
  await fs.remove('./desktop/translations');
  await fs.copy('./lib/backend', './desktop');
  await fs.copy(
    './android/app/src/main/assets/translations',
    './desktop/translations',
  );
  await fs.copy('./src/backend/package.json', './desktop/package.json');
  await fs.copy('./src/backend/patches', './desktop/patches');

  // This is not needed and it was failing our builds, see:
  // https://github.com/staltz/manyverse/actions/runs/1697461629
  rimraf.sync('./desktop/patches/ssb-validate2-rsjs-node*');

  await fs.copy(
    './src/backend/package-lock.json',
    './desktop/package-lock.json',
  );
  await fs.promises.rename(
    './desktop/loader.desktop.js',
    './desktop/loader.js',
  );
  rimraf.sync('./desktop/*.js.map');
  rimraf.sync('./desktop/plugins/*.js.map');
  await fs.remove('./desktop/loader.mobile.js');
})();
