#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const addStream = require('add-stream');
const intoStream = require('into-stream');
const generateChangelog = require('./generate-changelog');

intoStream('--------------BEGIN APP STORE--------------\n')
  .pipe(addStream(generateChangelog(1, 'ios')))
  .pipe(addStream(intoStream('----------------END APP STORE---------------\n')))
  .pipe(process.stdout);
