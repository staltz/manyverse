#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

var fs = require('fs');

// All the neon npm packages we want to patch
const modules = ['ssb-keys-neon', 'ssb-keys-mnemonic-neon'];

const projectPath = process.cwd();
for (let module of modules) {
  const pkgPath = `${projectPath}/nodejs-assets/nodejs-project/node_modules/${module}/package.json`;
  const pkgJson = require(pkgPath);
  // On postinstall (thus after compiling), convert native/index.node from file to folder
  pkgJson.scripts['postinstall'] =
    'mv native/index.node native/index && ' +
    'mkdir native/index.node && ' +
    'mv native/index native/index.node/index';
  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2), 'utf-8');
}
