#!/usr/bin/env node

const addStream = require('add-stream');
const intoStream = require('into-stream');
const fs = require('fs');
const generateChangelog = require('./generate-changelog');

intoStream('# Changelog\n\n')
  .pipe(addStream(generateChangelog(0)))
  .pipe(fs.createWriteStream('./CHANGELOG.md'));
