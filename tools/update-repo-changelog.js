#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const addStream = require('add-stream');
const intoStream = require('into-stream');
const fs = require('fs');
const generateChangelog = require('./generate-changelog');

intoStream(
  '# Changelog\n' +
    '\n' +
    '**Update from [manyver.se/download](https://manyver.se/download):**\n' +
    '\n',
)
  .pipe(addStream(generateChangelog(0)))
  .pipe(fs.createWriteStream('./CHANGELOG.md'));
