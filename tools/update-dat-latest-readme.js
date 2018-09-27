#!/usr/bin/env node

const addStream = require('add-stream');
const intoStream = require('into-stream');
const fs = require('fs');
const generateChangelog = require('./generate-changelog');

intoStream(
  '# Manyverse\n\n*A social network off the grid*\n\n[Website](https://manyver.se)\n\n',
)
  .pipe(addStream(generateChangelog(1)))
  .pipe(fs.createWriteStream('../dat-release-latest/README.md'));
