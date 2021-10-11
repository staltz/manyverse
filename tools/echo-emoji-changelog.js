#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const generateChangelog = require('./generate-changelog');

generateChangelog(1, 'emoji').pipe(process.stdout);
