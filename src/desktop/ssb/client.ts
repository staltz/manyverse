/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ssbClient from 'electron-ssb-client';
import cachedAboutSelf from '../../frontend/ssb/plugins/cachedAboutSelf';
import threadsUtilsPlugin from '../../frontend/ssb/plugins/threadsUtils';
import manifest from './manifest';

function makeClient() {
  return ssbClient(manifest)
    .use(require('ssb-deweird/consumer'))
    .use(cachedAboutSelf())
    .use(threadsUtilsPlugin())
    .callPromise();
}

export default makeClient;
