#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs-extra');
const rimraf = require('rimraf');
const util = require('util');
const rawExec = util.promisify(require('child_process').exec);

const isMobile = process.argv.includes('--mobile');
const folder = isMobile ? './nodejs-assets/nodejs-project' : './desktop';

async function exec(command, opts) {
  try {
    var {stdout, stderr} = await rawExec(command, opts);
  } catch (err) {
    console.error(stderr);
    console.error(err.stack);
    process.exit(err.code);
  }
  console.log(stdout);
}

(async function () {
  await exec(
    [
      'node node_modules/noderify/index.js',

      // This module doesn't yet work with Electron, and we don't want Rust:
      '--replace.ssb-validate2-rsjs-node=ssb-validate2',

      // Can't remember why we need to replace it, build seemed to fail:
      '--replace.node-extend=xtend',

      // After noderified, the paths to .node files might be different, so
      // we use a special fork of bindings
      isMobile ? '--replace.bindings=bindings-noderify-nodejs-mobile' : null,

      // Needs special compilation configs for android, and we'd like to
      // remove unused packages such as sodium-browserify etc
      isMobile
        ? '--replace.chloride=sodium-chloride-native-nodejs-mobile'
        : null,

      // Newer versions of leveldown are intentionally ignoring
      // nodejs-mobile support, so we run an older version
      isMobile ? '--replace.leveldown=leveldown-nodejs-mobile' : null,

      // We don't need it, and bl@0.8.x has security vulnerabilities
      isMobile ? '--filter=bl' : null,

      // Optional dependency within package `debug`
      isMobile ? '--filter=supports-color' : null,

      // Not used on this platform:
      isMobile
        ? '--filter=multiserver-electron-ipc'
        : '--filter=multiserver-rn-channel',

      // Not used on desktop, and on mobile should not be noderified:
      '--filter=rn-bridge',

      // Not used on mobile, and on desktop it should not be noderified:
      '--filter=electron',

      // We want to load their native bindings:
      '--filter=bufferutil',
      '--filter=utf-8-validate',

      '--out=_index.js',
      'index.js',
    ]
      .filter((x) => x !== null)
      .join(' '),
    {
      cwd: folder,
    },
  );

  rimraf.sync(`${folder}/index.js`);
  await fs.move(`${folder}/_index.js`, `${folder}/index.js`);
  rimraf.sync(`${folder}/one-time-fixes.js`);
  rimraf.sync(`${folder}/identity.js`);
  rimraf.sync(`${folder}/ssb.js`);
  rimraf.sync(`${folder}/plugins`);
})();
