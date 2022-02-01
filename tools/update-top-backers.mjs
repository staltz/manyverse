#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const thisYear = new Date().getFullYear();
const OC_URL = 'https://opencollective.com/manyverse/members.json';
const AMOUNT = 5;
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
const OUTPUT_FILE = path.join(
  __dirname,
  '..',
  'src',
  'frontend',
  'screens',
  'dialog-thanks',
  'backers.ts',
);

function removeDuplicates(arr, pickKey) {
  const map = new Map();
  for (const item of arr) {
    // To remove duplicate entries, we match items by their profile URL
    map.set(pickKey(item), item);
  }
  return [...map.values()];
}

(async function main() {
  const response = await fetch(OC_URL);
  const results = await response.json();

  const backers = removeDuplicates(results, (backer) => backer.profile).filter(
    (backer) => backer.type === 'USER' && backer.role === 'BACKER',
  );

  const topBackers = backers
    .sort((a, b) => b.totalAmountDonated - a.totalAmountDonated)
    .slice(0, AMOUNT);

  const topBackerNames = topBackers.map((backer) => backer.name);

  const fileContent =
    HEADER +
    '\n\n' +
    'export default ' +
    JSON.stringify(topBackerNames, null, 2) +
    ';\n';

  await fs.promises.writeFile(OUTPUT_FILE, fileContent, {encoding: 'ascii'});
})();
