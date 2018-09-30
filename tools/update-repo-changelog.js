#!/usr/bin/env node

const addStream = require('add-stream');
const intoStream = require('into-stream');
const fs = require('fs');
const generateChangelog = require('./generate-changelog');

intoStream(
  '# Changelog\n\n' +
    '**Update from:** [Play Store](https://play.google.com/store/apps/details?id=se.manyver) | [Dat Installer](https://github.com/staltz/dat-installer/) (`dat://manyverse-latest.hashbase.io`)\n\n',
)
  .pipe(addStream(generateChangelog(0)))
  .pipe(fs.createWriteStream('./CHANGELOG.md'));
