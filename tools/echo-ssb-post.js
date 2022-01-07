#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const addStream = require('add-stream');
const intoStream = require('into-stream');
const generateChangelog = require('./generate-changelog');

intoStream('--------------BEGIN SCUTTLEBUTT POST--------------\n')
  .pipe(addStream(generateChangelog(1, 'emoji')))
  .pipe(
    addStream(
      intoStream(
        '**Update from: [manyver.se/download](https://manyver.se/download)**\n\n' +
          '#manyverse\n' +
          '----------------END SCUTTLEBUTT POST---------------\n',
      ),
    ),
  )
  .pipe(process.stdout);
