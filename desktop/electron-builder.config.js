// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const path = require('path');
const rimraf = require('rimraf');
const topPackageJSON = require('../package.json');
const backendPackageJSON = require('./package.json');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const firstCopyrightYear = 2018;
const lastCopyrightYear = new Date().getFullYear();

module.exports = {
  // Metadata ------------------------------------------------------------------
  appId: 'se.manyver',
  productName: capitalize(topPackageJSON.name),
  copyright: `${firstCopyrightYear}-${lastCopyrightYear} The Manyverse Authors`,
  buildVersion: topPackageJSON.version,
  extraMetadata: {
    name: topPackageJSON.name,
    version: topPackageJSON.version,
    description: 'A social network off the grid',
    author: 'The Manyverse Authors',
    homepage: 'https://manyver.se',
    license: 'MPL-2.0',
    repository: 'https://gitlab.com/staltz/manyverse/',
  },
  protocols: [{name: 'ssb', schemes: ['ssb']}],

  // Electron-builder options --------------------------------------------------
  asar: true,
  npmRebuild: true,
  electronVersion: backendPackageJSON.optionalDependencies.electron,

  // All things files and directories ------------------------------------------
  directories: {
    app: __dirname,
    buildResources: path.join(__dirname, 'build-resources'),
    output: path.join(__dirname, 'built'),
  },
  files: [
    'node_modules/**/build/Release/*.node', // Node native modules
    'node_modules/**/build/Release/*.so*', // Node native modules
    'node_modules/node-gyp-build/index.js', // needed for sodium-chloride
    'node_modules/sodium-native/index.js', // needed for sodium-chloride
    'node_modules/sodium-chloride/index.js', // it bypasses noderify require()
    'renderer-dist',
    'translations',
    'index.html',
    'index.js',
    'loader.js',
    'package.json',
    '!node_modules/electron',
    '!node_modules/*-nodejs-mobile',
  ],
  beforeBuild: (conf) => {
    // Remove prebuilds so to force recompilation for Electron
    console.log('  • beforeBuild, remove native modules prebuilds');
    const node_modules = path.join(__dirname, 'node_modules');
    rimraf.sync(node_modules + '/**/**/bufferutil/prebuilds');
    rimraf.sync(node_modules + '/**/**/sodium-native/prebuilds');
    rimraf.sync(node_modules + '/**/**/leveldown/prebuilds');
    rimraf.sync(node_modules + '/**/**/utf-8-validate/prebuilds');
  },

  // Target-specific configurations --------------------------------------------
  linux: {
    icon: path.join(__dirname, 'build-resources', 'linux-app-icon'),
    target: [
      {
        target: 'deb',
        arch: ['x64'],
      },
    ],
    mimeTypes: ['x-scheme-handler/ssb'],
    category: 'Network',
  },

  deb: {
    packageCategory: 'net',
    priority: 'optional',
    maintainer: "Andre 'Staltz' Medeiros <contact@staltz.com>",
  },
};
