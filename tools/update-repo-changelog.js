#!/usr/bin/env node

const addStream = require('add-stream');
const intoStream = require('into-stream');
const fs = require('fs');
const generateChangelog = require('./generate-changelog');

intoStream(
  '# Changelog\n' +
    '\n' +
    '**Update from one of these sources:**\n' +
    '\n' +
    '- [Play Store](https://play.google.com/store/apps/details?id=se.manyver)\n' +
    '- [F-Droid](https://f-droid.org/packages/se.manyver/)\n' +
    '- [Dat Installer](https://github.com/staltz/dat-installer/) (insert `dat://manyverse-latest.hashbase.io`)\n' +
    '\n',
)
  .pipe(addStream(generateChangelog(0)))
  .pipe(fs.createWriteStream('./CHANGELOG.md'));
