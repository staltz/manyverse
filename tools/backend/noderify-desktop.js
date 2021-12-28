#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs-extra');
const rimraf = require('rimraf');
const util = require('util');
const rawExec = util.promisify(require('child_process').exec);

const rustEnabled = !process.argv.includes('--no-rust');

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

      // For better performance in Rust:
      rustEnabled ? '--replace.ssb-keys=ssb-keys-neon' : null,
      rustEnabled ? '--replace.ssb-keys-mnemonic=ssb-keys-mnemonic-neon' : null,
      // Use a "better" fork of this package:
      '--replace.non-private-ip=non-private-ip-android',
      // Fix a corner case bug with error recovery:
      '--replace.multiserver/plugins/net=staltz-multiserver/plugins/net',
      // This module doesn't yet work with Electron:
      '--replace.ssb-validate2-rsjs-node=ssb-validate2',
      // Can't remember why we need to replace it, build seemed to fail:
      '--replace.node-extend=xtend',

      // Not used on desktop, it's specific to mobile:
      '--filter=rn-bridge',
      '--filter=multiserver-rn-channel',
      // We want to load its native bindings:
      '--filter=electron',
      '--filter=bufferutil',
      '--filter=utf-8-validate',

      '--out=_index.js',
      'index.js',
    ]
      .filter((x) => x !== null)
      .join(' '),
    {
      cwd: './desktop',
    },
  );

  rimraf.sync('./desktop/index.js');
  await fs.move('./desktop/_index.js', './desktop/index.js');
  rimraf.sync('./desktop/one-time-fixes.js');
  rimraf.sync('./desktop/restore.js');
  rimraf.sync('./desktop/ssb.js');
  rimraf.sync('./desktop/plugins');
})();
