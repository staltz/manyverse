#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import addStream from 'add-stream';
import intoStream from 'into-stream';
import generateChangelog from './generate-changelog.mjs';

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
