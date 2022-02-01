#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import addStream from 'add-stream';
import intoStream from 'into-stream';
import fs from 'fs';
import generateChangelog from './generate-changelog.mjs';

intoStream(
  '# Changelog\n' +
    '\n' +
    '**Update from [manyver.se/download](https://manyver.se/download):**\n' +
    '\n',
)
  .pipe(addStream(generateChangelog(0)))
  .pipe(fs.createWriteStream('./CHANGELOG.md'));
