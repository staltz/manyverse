#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import generateChangelog from './generate-changelog.mjs';

generateChangelog(1, 'emoji').pipe(process.stdout);
