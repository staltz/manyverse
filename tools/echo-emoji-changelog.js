#!/usr/bin/env node

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const generateChangelog = require('./generate-changelog');

generateChangelog(1, 'emoji').pipe(process.stdout);
