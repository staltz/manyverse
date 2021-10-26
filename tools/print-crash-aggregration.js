#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

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

console.log('Copy-paste many crash reports here and then press Ctrl+C\n');

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
