#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lines = [];
const appVersions = new Set();
const osVersions = new Set();
const matrixAppOS = {};

const APPVER = 'App: se.manyver ';
const OSVER = 'OS: ';

rl.prompt();

rl.on('line', (line) => {
  lines.push(line);
});

function collectData() {
  for (let i = 0; i < lines.length - 2; i++) {
    const line1 = lines[i];
    const line3 = lines[i + 2];
    if (line1.startsWith(APPVER) && line3.startsWith(OSVER)) {
      const appV = line1.split(APPVER)[1].split('-')[0];
      const osV = line3.match(/\([^\)]+\)/)[0].slice(1, -1);
      appVersions.add(appV);
      osVersions.add(osV);
      matrixAppOS[appV] = matrixAppOS[appV] || {};
      matrixAppOS[appV][osV] = (matrixAppOS[appV][osV] || 0) + 1;
    }
  }
}

function hyph(versionName) {
  return versionName
    .split('')
    .map(() => '-')
    .join('');
}

function printMarkdownTable() {
  const sortedAppVersions = [...appVersions.values()].sort();
  const sortedOSVersions = [...osVersions.values()].sort();

  const title =
    '\n\n## Matrix of occurrences along App versions versus OS versions\n\n';
  const header =
    '| | ' + sortedAppVersions.map((appV) => ` ${appV} |`).join('') + '\n';
  const divider =
    '|-|-' + sortedAppVersions.map((v) => `-${hyph(v)}-|`).join('') + '\n';
  const rows = sortedOSVersions
    .map(
      (osV) =>
        `| ${osV} | ` +
        sortedAppVersions
          .map((appV) => ` ${matrixAppOS[appV][osV] || ''} |`)
          .join(''),
    )
    .join('\n');

  console.log(title + header + divider + rows);
}

rl.on('close', (cmd) => {
  collectData();
  printMarkdownTable();
  process.exit(0);
});

/*
if (!process.argv[2]) {
  console.error('Error: please paste the stacktrace URL as the argument');
  process.exit(1);
}

// Download report file
const url = process.argv[2];
const code = url.split('uploads/')[1].split('/ACRA')[0];
const filename = path.resolve(os.tmpdir(), code + '.json');
execSync(`curl ${url} -o ${filename}`);
console.log('');

// Read JSON from the downloaded file
const contents = fs.readFileSync(filename);
const json = require(filename);

// Pretty format the JSON
const newContents = JSON.stringify(JSON.parse(contents), null, 2);
fs.writeFileSync(filename, newContents);

// Report important info on the console
console.log(
  `App: ${json.PACKAGE_NAME} ${json.APP_VERSION_NAME} (${
    json.APP_VERSION_CODE
  })`,
);
console.log(
  `Device: ${json.BUILD.MANUFACTURER} ${
    json.BUILD.MODEL
  } (${json.BUILD.SUPPORTED_ABIS.join(' | ')})`,
);
console.log(
  `OS: Android ${json.BUILD.VERSION.RELEASE} (SDK ${json.BUILD.VERSION.SDK})`,
);
if (json.BUILD.IS_EMULATOR) {
  console.log('THIS IS AN EMULATOR');
}
console.log(`User comment: ${json.USER_COMMENT}`);
console.log('');

if (json.STACK_TRACE.startsWith('java.lang.Exception: ')) {
  const nodejsStackTrace = json.STACK_TRACE.split('java.lang.Exception: ')[1]
    .split('at se.manyver.MainActivity$1$1.invoke')[0]
    .trim()
    .replace(/\\\\n/g, '\n');
  console.log('Stack trace from Node.js:');
  console.log(nodejsStackTrace);
} else {
  console.log('Stack trace from Java:');
  console.log(json.STACK_TRACE);
}
*/
