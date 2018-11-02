/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const manifestServer = require('../nodejs-project/manifest');

function objMapDeep(origin: object, transform: (s: string) => string): object {
  return Object.keys(origin).reduce((acc, key) => {
    if (typeof origin[key] === 'object') {
      acc[key] = objMapDeep(origin[key], transform);
    } else {
      acc[key] = transform(origin[key]);
    }
    return acc;
  }, {});
}

function syncToAsync(str: string): string {
  return str === 'sync' ? 'async' : str;
}

export const manifest = objMapDeep(manifestServer, syncToAsync);
