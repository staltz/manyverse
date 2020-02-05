#!/usr/bin/env node

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const addStream = require('add-stream');
const intoStream = require('into-stream');
const generateChangelog = require('./generate-changelog');

intoStream('--------------BEGIN GOOGLE PLAY--------------\n')
  .pipe(addStream(generateChangelog(1, 'and')))
  .pipe(
    addStream(intoStream('----------------END GOOGLE PLAY---------------\n')),
  )
  .pipe(process.stdout);
