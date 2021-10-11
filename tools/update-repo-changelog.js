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
    '**Update from one of these sources:**\n' +
    '\n' +
    '- (Android) [Play Store](https://play.google.com/store/apps/details?id=se.manyver)\n' +
    '- (Android) [F-Droid](https://f-droid.org/packages/se.manyver/)\n' +
    '- (Android) [APK file](https://manyver.se/apk)\n' +
    '- (iOS) [App Store](https://apps.apple.com/app/manyverse/id1492321617)\n' +
    '\n',
)
  .pipe(addStream(generateChangelog(0)))
  .pipe(fs.createWriteStream('./CHANGELOG.md'));
