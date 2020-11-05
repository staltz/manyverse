#!/usr/bin/env node

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const addStream = require('add-stream');
const intoStream = require('into-stream');
const generateChangelog = require('./generate-changelog');

intoStream('--------------BEGIN SCUTTLEBUTT POST--------------\n')
  .pipe(addStream(generateChangelog(1, 'emoji')))
  .pipe(
    addStream(
      intoStream(
        '**Update from one of these sources:**\n\n' +
          '- (Android) [APK file](https://manyver.se/apk) (available now)\n' +
          '- (Android) [Play Store](https://play.google.com/store/apps/details?id=se.manyver) (available within 12h)\n' +
          '- (iOS) [App Store](https://apps.apple.com/app/manyverse/id1492321617) (available within 24h)\n' +
          '- (Android) [F-Droid](https://f-droid.org/packages/se.manyver/) (available within 72h or more)\n' +
          '----------------END SCUTTLEBUTT POST---------------\n',
      ),
    ),
  )
  .pipe(process.stdout);
