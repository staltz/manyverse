#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import util from 'util';
import ora from 'ora';
import childProcess from 'child_process';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const fsExtra = require('fs-extra');

const exec = util.promisify(childProcess.exec);
const loading = ora('...').start();
const verbose = !!process.argv.includes('--verbose');
const targetPlatform = process.argv.includes('--ios')
  ? 'ios'
  : process.argv.includes('--desktop')
  ? 'desktop'
  : 'android';

async function runAndReport(label, task) {
  const now = Date.now();
  try {
    loading.start(label);
    var {stdout, stderr} = await task;
  } catch (err) {
    loading.fail();
    if (verbose) {
      console.error(stderr);
    }
    console.error(err.stack);
    process.exit(err.code);
  }
  const duration = Date.now() - now;
  const durationLabel =
    duration < 1000
      ? duration + ' milliseconds'
      : duration < 60000
      ? (duration * 0.001).toFixed(1) + ' seconds'
      : ((duration * 0.001) / 60).toFixed(1) + ' minutes';
  loading.succeed(
    `${label}${duration >= 1000 ? ' (' + durationLabel + ')' : ''}`,
  );
  if (verbose) {
    console.log(stdout);
  }
}

(async function () {
  await runAndReport('Compile TypeScript', exec('npm run lib'));

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Move backend project to ./desktop',
      exec('node tools/backend/move-to-desktop.js'),
    );
  } else {
    await runAndReport(
      'Move backend project to ./nodejs-assets',
      exec('./tools/backend/move-to-nodejs-assets.sh'),
    );
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Install backend node modules',
      exec('npm install', {
        cwd: './desktop',
        maxBuffer: 1000 * 1000 * 10, // 10 MiB
      }),
    );
  } else if (targetPlatform === 'ios') {
    await runAndReport(
      'Install backend node modules',
      exec('npm install --omit=optional --ignore-scripts', {
        cwd: './nodejs-assets/nodejs-project',
        env: {
          PLATFORM_NAME: 'iphoneos',
          DONT_COMPILE: '1',
          ...process.env,
        },
      }),
    );
  } else {
    await runAndReport(
      'Install backend node modules',
      exec('npm install --omit=optional --ignore-scripts', {
        env: {
          DONT_COMPILE: '1',
          ...process.env,
        },
        cwd: './nodejs-assets/nodejs-project',
      }),
    );
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Apply patches to node modules',
      exec('npm run apply-patches', {
        cwd: './desktop',
      }),
    );
  } else {
    await runAndReport(
      'Apply patches to node modules',
      exec('npm run apply-patches', {
        cwd: './nodejs-assets/nodejs-project',
      }),
    );
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Update package-lock.json in ./src/backend',
      // Use fs-extra to support Windows
      fsExtra
        .copy('./desktop/package-lock.json', './src/backend/package-lock.json')
        .then(
          () => ({stdout: '', stderr: ''}),
          () => ({stdout: '', stderr: 'Failed to copy package-lock.json'}),
        ),
    );
  } else {
    await runAndReport(
      'Update package-lock.json in ./src/backend',
      exec(
        'cp ./nodejs-assets/nodejs-project/package-lock.json ' +
          './src/backend/package-lock.json',
      ),
    );
  }

  if (targetPlatform === 'android' || targetPlatform === 'ios') {
    await runAndReport(
      'Pre-remove files not necessary for Android nor iOS',
      exec('./tools/backend/pre-remove-unused-files.sh'),
    );
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Pre-remove files not necessary for Electron',
      exec('node tools/backend/pre-remove-unused-files-desktop.js'),
    );
  }

  if (targetPlatform === 'android') {
    await runAndReport(
      'Build native modules for Android armeabi-v7a and arm64-v8a',
      exec('./tools/backend/build-native-modules.sh', {
        maxBuffer: 4 * 1024 * 1024 /* 4MB worth of logs in stdout */,
      }),
    );
  }

  if (targetPlatform === 'android') {
    await runAndReport(
      'Post-remove files not necessary for Android',
      exec('./tools/backend/post-remove-unused-files.sh'),
    );
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Bundle and minify backend JS into one file',
      exec('node tools/backend/noderify.js --desktop'),
    );
  } else {
    await runAndReport(
      'Bundle and minify backend JS into one file',
      exec('node tools/backend/noderify.js --mobile'),
    );
  }

  if (targetPlatform === 'android') {
    await runAndReport(
      'Move some shared dynamic native libraries to Android jniLibs',
      exec('./tools/backend/move-shared-libs-android.sh'),
    );

    await runAndReport(
      'Remove node_modules folder from the Android project',
      exec(
        'rm -rf ./nodejs-assets/nodejs-project/node_modules && ' +
          'rm -rf ./nodejs-assets/nodejs-project/patches &&' +
          'rm ./nodejs-assets/nodejs-project/package-lock.json',
      ),
    );
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Remove patches from the desktop folder',
      // Use fs-extra to support Windows
      fsExtra.rmdir('./desktop/patches', {recursive: true}).then(
        () => ({stdout: '', stderr: ''}),
        () => ({stdout: '', stderr: 'Failed to remove patches folder'}),
      ),
    );
    await runAndReport(
      'Remove package-lock.json from the desktop folder',
      // Use fs-extra to support Windows
      fsExtra.rm('./desktop/package-lock.json').then(
        () => ({stdout: '', stderr: ''}),
        () => ({stdout: '', stderr: 'Failed to remove package-lock.json'}),
      ),
    );
  }
})();
