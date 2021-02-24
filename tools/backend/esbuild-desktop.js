#!/usr/bin/env node
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const path = require('path');
const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');

const projectPath = process.cwd();
const nodejsProjectPath = `${projectPath}/desktop/nodejs-project`;

const to = (name, file = 'index.js') =>
  path.resolve(nodejsProjectPath, 'node_modules', name, file);

esbuild
  .build({
    entryPoints: [`${nodejsProjectPath}/index.js`],
    outfile: `${nodejsProjectPath}/_esbuilt.js`,
    bundle: true,
    platform: 'node',
    target: ['es2019', 'chrome85', 'node12.16.0'],
    // metafile: `${nodejsProjectPath}/meta.json`,
    minifySyntax: true,
    external: [
      'electron', // we want to load its native bindings
      'rn-bridge', // not used on desktop, it's specific to mobile
      'multiserver-rn-channel', // not used on desktop, it's specific to mobile
      'bufferutil', // we want to load its native bindings
      'utf-8-validate', // we want to load its native bindings
    ],
    plugins: [
      alias({
        // we use ssb-keys-neon for better performance in Rust
        'ssb-keys': to('ssb-keys-neon', 'lib/index.js'),

        // we use ssb-keys-mnemonic-neon for better performance in Rust
        'ssb-keys-mnemonic': to('ssb-keys-mnemonic-neon', 'lib/index.js'),

        // can't remember why we need to replace it, build seemed to fail
        'node-extend': to('xtend', 'immutable.js'),

        // we use a "better" fork of this package
        'non-private-ip': to('non-private-ip-android'),

        // we're fixing a corner case bug with error recovery
        'multiserver/plugins/net': to('staltz-multiserver/plugins', 'net.js'),
      }),
    ],
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
