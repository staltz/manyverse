/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {shortFeedId} from '../../from-ssb';
const nest = require('depnest');

const shortFeedIdOpinion = {
  gives: nest('about.sync.shortFeedId'),
  create: (api: any) => {
    return nest('about.sync.shortFeedId', shortFeedId);
  },
};

export default shortFeedIdOpinion;
