#!/usr/bin/env node

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');
const sortBy = require('lodash.sortby');
const sortedUniqBy = require('lodash.sorteduniqby');

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

const header = `/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */`;

(async function() {
  if (!fs.existsSync(topLevelNodeModules)) {
    console.error('ERROR: we first need to npm install at the top level');
    process.exit(1);
  }

  await exec(
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
  );

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

  const images = require('../images/licenses.json').map(x => ({
    ...x,
    type: 'image',
  }));

  const backendLibraries = require('../lls-backend.json');
  const frontendLibraries = require('../lls-frontend.json').filter(
    // optionalDependencies, don't report
    x => !['appium', 'tap-spec', 'tape', 'wd'].includes(x.name),
  );
  const allLibraries = sortedUniqBy(
    sortBy(backendLibraries.concat(frontendLibraries), 'name'),
    x => x.name,
  ).map(x => {
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
})();
