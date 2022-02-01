#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import addStream from 'add-stream';
import intoStream from 'into-stream';
import generateChangelog from './generate-changelog.mjs';

intoStream('--------------BEGIN GOOGLE PLAY--------------\n')
  .pipe(addStream(generateChangelog(1, 'and')))
  .pipe(
    addStream(intoStream('----------------END GOOGLE PLAY---------------\n')),
  )
  .pipe(process.stdout);
