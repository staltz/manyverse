#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import addStream from 'add-stream';
import intoStream from 'into-stream';
import generateChangelog from './generate-changelog.mjs';

intoStream('--------------BEGIN APP STORE--------------\n')
  .pipe(addStream(generateChangelog(1, 'ios')))
  .pipe(addStream(intoStream('----------------END APP STORE---------------\n')))
  .pipe(process.stdout);
