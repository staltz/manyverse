#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');
const ora = require('ora');
const sortBy = require('lodash.sortby');
const sortedUniqBy = require('lodash.sorteduniqby');

const loading = ora('...').start();
const verbose = !!process.argv.includes('--verbose');
const topLevelFolder = path.join(__dirname, '..');
const topLevelNodeModules = path.join(topLevelFolder, 'node_modules');
const backendFolder = path.join(__dirname, '..', 'src', 'backend');
const outputFile = path.join(
  __dirname,
  '..',
  'src',
  'frontend',
  'libraries.ts',
);
const backendNodeModules = path.join(backendFolder, 'node_modules');

const thisYear = new Date().getFullYear();
const header =
  '// ' +
  'SP' +
  `DX-FileCopyrightText: ${thisYear} The Manyverse Authors\n` +
  '//\n' +
  '// ' +
  'SP' +
  'DX-License-Identifier: CC0-1.0';

async function runAndReport(label, task) {
  const now = Date.now();
  try {
    loading.start(label);
    if (typeof task === 'function') {
      await task();
    } else {
      var {stdout, stderr} = await task;
    }
  } catch (err) {
    loading.fail();
    if (verbose && stderr) {
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
  if (verbose && stdout) {
    console.log(stdout);
  }
}

(async function () {
  if (!fs.existsSync(topLevelNodeModules)) {
    console.error('ERROR: we first need to npm install at the top level');
    process.exit(1);
  }

  await runAndReport(
    'Collect all licenses for frontend dependencies',
    exec(
      [
        '$(npm bin)/license-ls',
        '--production',
        '--depth=0',
        '--format=json',
        '> lls-frontend.json',
      ].join(' '),
      {
        cwd: topLevelFolder,
      },
    ),
  );

  await runAndReport(
    'Collect all licenses for backend dependencies',
    async () => {
      await exec('npm install', {cwd: backendFolder});
      await exec(
        [
          '$(npm bin)/license-ls',
          '--production',
          '--depth=0',
          '--format=json',
          '> ../../lls-backend.json',
        ].join(' '),
        {
          cwd: backendFolder,
        },
      );
      await exec('rm -rf ' + backendNodeModules);
    },
  );

  await runAndReport('Produce file src/frontend/libraries.ts', async () => {
    const images = require('../images/licenses.json').map((x) => ({
      ...x,
      type: 'image',
    }));

    const backendLibraries = require('../lls-backend.json');
    const frontendLibraries = require('../lls-frontend.json').filter(
      // optionalDependencies, don't report
      (x) => !['appium', 'tap-spec', 'tape', 'wd'].includes(x.name),
    );

    const allLibraries = sortedUniqBy(
      sortBy(backendLibraries.concat(frontendLibraries), 'name'),
      (x) => x.name,
    ).map((x) => {
      // Patch some packages that are missing the homepage
      if (x.name === 'react-native-bluetooth-socket-bridge') {
        x.homepage =
          'https://github.com/Happy0/react-native-bluetooth-socket-bridge/';
      }
      return {
        name: x.name,
        type: 'library',
        version: x.version,
        license: x.license,
        homepage: x.homepage,
      };
    });
    const reported = [].concat(images).concat(allLibraries);

    const fileContent =
      header +
      '\n\n' +
      'export default ' +
      JSON.stringify(reported, null, 2) +
      ';\n';

    fs.writeFileSync(outputFile, fileContent, {
      encoding: 'ascii',
    });

    await exec('$(npm bin)/prettier --write ' + outputFile);

    await exec('rm lls-backend.json', {cwd: topLevelFolder});

    await exec('rm lls-frontend.json', {cwd: topLevelFolder});
  });
})();
