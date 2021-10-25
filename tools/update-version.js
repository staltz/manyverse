#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const ReactNativeVersion = require('react-native-version');
const readline = require('readline');
const leftPad = require('left-pad');
const path = require('path');
const fs = require('fs');

const thisYear = new Date().getFullYear();
const HEADER =
  '// ' +
  'SP' +
  'DX-FileCopyrightText: ' +
  thisYear +
  ' The Manyverse Authors\n' +
  '//\n' +
  '// ' +
  'SP' +
  'DX-License-Identifier: CC0-1.0';
const VERSION_NAME_FILE = path.join(
  __dirname,
  '..',
  'src',
  'frontend',
  'versionName.ts',
);

const currentVersion = JSON.parse(fs.readFileSync('./package.json')).version;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createTodaysVersion(attempt) {
  const today = new Date();
  const yy = today.getFullYear() - 2000; // So it's two digits
  const mm = leftPad(today.getMonth() + 1, 2, '0');
  const d = today.getDate();
  if (attempt === 0) {
    return `0.${yy}${mm}.${d}-beta`;
  } else {
    const letter = String.fromCharCode(97 + attempt); // 0=a, 1=b, 2=c, ...
    return `0.${yy}${mm}.${d}-beta.${letter}`;
  }
}

let nextVersion;
for (let i = 0 /* letter a */; i <= 25 /* letter z */; i++) {
  nextVersion = createTodaysVersion(i);
  if (nextVersion !== currentVersion) break;
}
if (nextVersion === currentVersion) {
  console.error('I dont know what else to generate beyond ' + nextVersion);
  process.exit(1);
}

rl.question('Next version will be `' + nextVersion + '`, okay? y/n ', (yn) => {
  if (yn !== 'y' && yn !== 'Y') {
    console.log('Release cancelled.\n');
    process.exit(1);
    return;
  }

  const pkgJSON = JSON.parse(fs.readFileSync('./package.json'));
  const pkgLockJSON = JSON.parse(fs.readFileSync('./package-lock.json'));
  pkgJSON.version = nextVersion;
  pkgLockJSON.version = nextVersion;
  fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, null, 2));
  fs.writeFileSync('./package-lock.json', JSON.stringify(pkgLockJSON, null, 2));

  fs.writeFileSync(
    VERSION_NAME_FILE,
    HEADER + '\n\n' + `export default '${nextVersion}';` + '\n',
  );

  ReactNativeVersion.version(
    {neverAmend: true, target: ['android']},
    path.resolve(__dirname, '../'),
  ).catch((err) => {
    console.error(err);
    process.exit(1);
  });

  rl.close();
});
