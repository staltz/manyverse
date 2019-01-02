/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {ssbPath} from '../defaults';
const Config = require('ssb-config/inject');
const nest = require('depnest');

const configOpinion = {
  gives: nest('config.sync.load'),
  create: (api: any) => {
    let config: any;
    return nest('config.sync.load', () => {
      if (!config) {
        config = Config('ssb');
        config.path = ssbPath;
      }
      return config;
    });
  },
};

export default configOpinion;
