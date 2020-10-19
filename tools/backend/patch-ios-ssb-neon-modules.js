#!/usr/bin/env node
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var fs = require('fs');

// All the neon npm packages we want to patch
const modules = ['ssb-keys-neon'];

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
