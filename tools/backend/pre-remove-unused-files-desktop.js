#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

var rimraf = require('rimraf');

// Remove *-nodejs-mobile libraries that are not used in Electron
rimraf.sync('./desktop/node_modules/*-nodejs-mobile');
