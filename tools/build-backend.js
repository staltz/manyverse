#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const util = require('util');
const ora = require('ora');
const exec = util.promisify(require('child_process').exec);

const loading = ora('...').start();
const verbose = !!process.argv.includes('--verbose');
const rustEnabled = !process.argv.includes('--no-rust');
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
      exec('./tools/backend/move-to-desktop.sh'),
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
        cwd: './desktop/nodejs-project',
        maxBuffer: 1000 * 1000 * 10, // 10 MiB
      }),
    );
  } else if (targetPlatform === 'ios') {
    await runAndReport(
      'Install backend node modules',
      exec('npm install --no-optional', {
        cwd: './nodejs-assets/nodejs-project',
        env: {
          PLATFORM_NAME: 'iphoneos',
          ...process.env,
        },
      }),
    );
  } else {
    await runAndReport(
      'Install backend node modules',
      exec('npm install --no-optional', {
        cwd: './nodejs-assets/nodejs-project',
      }),
    );
  }

  if (rustEnabled) {
    if (targetPlatform === 'android') {
      await runAndReport(
        'Patch ssb-neon packages to configure linking with nodejs-mobile',
        exec('./tools/backend/patch-android-ssb-neon-modules.sh'),
      );
    } else if (targetPlatform === 'ios') {
      await runAndReport(
        'Patch ssb-neon packages to add a postinstall script specific to iOS',
        exec('./tools/backend/patch-ios-ssb-neon-modules.js'),
      );
    }
  } else {
    const rustNodeModules = [
      'ssb-keys-neon',
      'ssb-keys-mnemonic-neon',
      'ssb-validate2-rsjs-node',
    ];
    if (targetPlatform === 'desktop') {
      await runAndReport(
        'Remove Rust node modules',
        exec('rm -rf ' + rustNodeModules.join(' '), {
          cwd: './desktop/nodejs-project/node_modules',
        }),
      );
    } else {
      await runAndReport(
        'Remove Rust node modules',
        exec('rm -rf ' + rustNodeModules.join(' '), {
          cwd: './nodejs-assets/nodejs-project/node_modules',
        }),
      );
    }
  }

  if (targetPlatform === 'desktop') {
    await runAndReport(
      'Update package-lock.json in ./src/backend',
      exec(
        'cp ./desktop/nodejs-project/package-lock.json ' +
          './src/backend/package-lock.json',
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
    if (rustEnabled) {
      await runAndReport(
        'Bundle and minify backend JS into one file',
        exec('./tools/backend/noderify-desktop.sh'),
      );
    } else {
      await runAndReport(
        'Bundle and minify backend JS into one file',
        exec('./tools/backend/noderify-desktop-no-rust.sh'),
      );
    }
  } else {
    if (rustEnabled) {
      await runAndReport(
        'Bundle and minify backend JS into one file',
        exec('./tools/backend/noderify-mobile.sh'),
      );
    } else {
      await runAndReport(
        'Bundle and minify backend JS into one file',
        exec('./tools/backend/noderify-mobile-no-rust.sh'),
      );
    }
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
})();
