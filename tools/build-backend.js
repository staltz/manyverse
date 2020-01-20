#!/usr/bin/env node
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const util = require('util');
const ora = require('ora');
const exec = util.promisify(require('child_process').exec);

const loading = ora('...').start();
const verbose = !!process.argv.includes('--verbose');
const targetPlatform = !!process.argv.includes('--ios') ? 'ios' : 'android';

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
  loading.succeed(`${label} (${durationLabel})`);
  if (verbose) {
    console.log(stdout);
  }
}

(async function() {
  await runAndReport('Compile TypeScript', exec('npm run lib'));

  await runAndReport(
    'Move backend project to ./nodejs-assets',
    exec('./tools/backend/move-to-nodejs-assets.sh'),
  );

  await runAndReport(
    'Install backend node modules',
    exec('npm install --no-optional', {cwd: './nodejs-assets/nodejs-project'}),
  );

  await runAndReport(
    'Update package-lock.json in ./src/backend',
    exec(
      'cp ./nodejs-assets/nodejs-project/package-lock.json ' +
        './src/backend/package-lock.json',
    ),
  );

  await runAndReport(
    'Remove unused files meant for macOS or Windows or Electron',
    exec('./tools/backend/remove-unused-files.sh'),
  );

  if (targetPlatform === 'android') {
    await runAndReport(
      'Build native modules for Android armeabi-v7a and arm64-v8a',
      exec('./tools/backend/build-native-modules.sh', {
        maxBuffer: 1024 * 1024 * 4 /* 4MB */,
      }),
    );
  }

  await runAndReport(
    'Bundle and minify backend JS into one file',
    exec('./tools/backend/bundle-noderify.sh'),
  );

  if (targetPlatform === 'android') {
    await runAndReport(
      'Move some shared dynamic native libraries to Android jniLibs',
      exec('./tools/backend/move-shared-libs-android.sh'),
    );

    await runAndReport(
      'Remove node_modules folder from the Android project',
      exec(
        'rm -rf ./nodejs-assets/nodejs-project/node_modules && ' +
          'rm ./nodejs-assets/nodejs-project/package-lock.json',
      ),
    );
  }
})();
