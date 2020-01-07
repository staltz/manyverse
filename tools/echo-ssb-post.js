#!/usr/bin/env node

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const addStream = require('add-stream');
const intoStream = require('into-stream');
const generateChangelog = require('./generate-changelog');

intoStream('--------------BEGIN SCUTTLEBUTT POST--------------\n')
  .pipe(addStream(generateChangelog(1)))
  .pipe(
    addStream(
      intoStream(
        '**Update from one of these sources:**\n\n' +
          '- (Android) [Dat Installer](https://github.com/staltz/dat-installer/) (available now)\n' +
          '  - insert `dat://manyverse-latest.hashbase.io`\n' +
          '  - or insert `dat://520a00daf0a309bef7722b3f3338854e9da667d01e48dc7b83b118d86354d6d3`\n' +
          '- (Android) [Play Store](https://play.google.com/store/apps/details?id=se.manyver) (available within 3h – 18h)\n' +
          '- (iOS) [App Store](https://apps.apple.com/app/manyverse/id1492321617) (available within 24h – 48h, pending on Apple)\n' +
          '- (Android) [F-Droid](https://f-droid.org/packages/se.manyver/) (available within 72h)\n' +
          '----------------END SCUTTLEBUTT POST---------------\n',
      ),
    ),
  )
  .pipe(process.stdout);
