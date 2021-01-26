/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ssbClient from 'electron-ssb-client';
import cachedAbout from 'ssb-cached-about';
import manifest from './manifest';

function makeClient() {
  return ssbClient(manifest).use(cachedAbout()).callPromise();
}

export default makeClient;
