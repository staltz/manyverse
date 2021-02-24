#!/usr/bin/env node
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const path = require('path');
const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');

const projectPath = process.cwd();
const nodejsProjectPath = `${projectPath}/nodejs-assets/nodejs-project`;

const to = (name, file = 'index.js') =>
  path.resolve(nodejsProjectPath, 'node_modules', name, file);

esbuild
  .build({
    entryPoints: [`${nodejsProjectPath}/index.js`],
    outfile: `${nodejsProjectPath}/_esbuilt.js`,
    bundle: true,
    platform: 'node',
    target: ['es2019', 'node12.19.0'],
    metafile: `${nodejsProjectPath}/meta.json`,
    minifySyntax: true,
    external: [
      'rn-bridge', // not an npm package, it's just a nodejs-mobile shortcut
      'bl', // we didn't use this, and bl@0.8.x has security vulnerabilities
      'bufferutil', // we want nodejs-mobile to load its native bindings
      'supports-color', // optional dependency within package `debug`
      'electron', // not used on mobile, it's specific to desktop
      'multiserver-electron-ipc', // not used on mobile, it's desktop-specific
      'utf-8-validate', // we want nodejs-mobile to load its native bindings
    ],
    plugins: [
      alias({
        // after esbuild, the paths to .node files might be different, so
        // we use a special fork of bindings
        bindings: to('bindings-noderify-nodejs-mobile', 'bindings.js'),

        // chloride: needs special compilation configs for android, and we'd
        // like to remove unused packages such as sodium-browserify etc
        chloride: to('sodium-chloride-native-nodejs-mobile'),

        // leveldown: newer versions of leveldown are intentionally ignoring
        // nodejs-mobile support, so we run an older version
        leveldown: to('leveldown-nodejs-mobile', 'leveldown.js'),

        // we use ssb-keys-neon for better performance in Rust
        'ssb-keys': to('ssb-keys-neon', 'lib/index.js'),

        // we use ssb-keys-mnemonic-neon for better performance in Rust
        'ssb-keys-mnemonic': to('ssb-keys-mnemonic-neon', 'lib/index.js'),

        // we want to compile for nodejs-mobile instead of using prebuilds
        'utp-native': to('utp-native-nodejs-mobile'),

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
