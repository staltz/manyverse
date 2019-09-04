/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nest = require('depnest');

function makeKeysOpinion(keys: any): any {
  const keysOpinion = {
    gives: nest({
      'keys.sync': ['load', 'id'],
    }),

    create: (api: any) => {
      return nest({
        'keys.sync': {load, id},
      });
      function id() {
        return load().id;
      }
      function load() {
        return keys;
      }
    },
  };
  return keysOpinion;
}

export default makeKeysOpinion;
