// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const path = require('path');
const rimraf = require('rimraf');
const topPackageJSON = require('../package.json');
const backendPackageJSON = require('./package.json');

const firstCopyrightYear = 2018;
const lastCopyrightYear = new Date().getFullYear();
const AUTHOR = 'The Manyverse Authors';
const NAME_HUMAN = 'Manyverse';
const NAME_COMPUTER = 'manyverse';

module.exports = {
  // Metadata ------------------------------------------------------------------
  appId: 'se.manyver',
  productName: NAME_HUMAN,
  copyright: `${firstCopyrightYear}-${lastCopyrightYear} ${AUTHOR}`,
  buildVersion: topPackageJSON.version,
  extraMetadata: {
    name: NAME_COMPUTER,
    version: topPackageJSON.version,
    description: 'A social network off the grid',
    author: AUTHOR,
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
    output: path.join(__dirname, 'outputs'),
  },
  files: [
    'node_modules/**/build/Release/*.node', // Node native modules
    'node_modules/**/build/Release/*.so*', // Node native modules (Linux)
    'node_modules/**/build/Release/*.dylib', // Node native modules (macOS)
    'node_modules/**/build/Release/*.dll', // Node native modules (Windows)
    'node_modules/electron-window-state', // needed in loader.js
    'node_modules/jsonfile', // needed in loader.js
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

  // Linux-specific configurations ---------------------------------------------
  linux: {
    icon: path.join(__dirname, 'build-resources', 'linux-app-icon'),
    target: [
      {target: 'deb', arch: ['x64']},
      {target: 'tar.gz', arch: ['x64']},
      // TODO: Fix support for SSB URIs in Manyverse AppImage, see:
      // https://github.com/electron-userland/electron-builder/issues/5024
      // {target: 'AppImage', arch: ['x64']},
    ],
    desktop: {
      StartupWMClass: NAME_COMPUTER,
    },
    category: 'Network',
  },

  deb: {
    packageCategory: 'net',
    priority: 'optional',
    maintainer: "Andre 'Staltz' Medeiros <contact@staltz.com>",
  },

  // Mac-specific configurations -----------------------------------------------
  mac: {
    icon: path.join(__dirname, 'build-resources', 'icon.icns'),
    category: 'public.app-category.social-networking',
    darkModeSupport: true,
    target: [{target: 'dmg'}],
    identity: null,
  },

  dmg: {
    icon: path.join(__dirname, 'build-resources', 'icon.icns'),
    background: path.join(__dirname, 'build-resources', 'dmg-background.png'),
  },

  // Windows-specific configurations -------------------------------------------
  win: {
    publisherName: AUTHOR,
  },

  nsis: {
    artifactName: '${name}-${version}-windows-${arch}-nsis-installer.${ext}',
    oneClick: false,
    perMachine: false,
    include: path.join(__dirname, 'scripts', 'installer.nsh'),
  },

  // Publish options -----------------------------------------------------------
  publish: {
    provider: 'github',
    protocol: 'https',
    owner: 'staltz',
    repo: 'manyverse',
    releaseType: 'release',
  },
};
