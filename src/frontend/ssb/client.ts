/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ssbClient from 'react-native-ssb-client';
import manifest from './manifest';
import hooksPlugin from './plugins/hooks';
import connUtilsPlugin from './plugins/connUtils';
import publishUtilsPlugin from './plugins/publishUtils';
import contactsPlugin from './plugins/contacts';
import threadsUtilsPlugin from './plugins/threadsUtils';
import cachedAboutSelf from './plugins/cachedAboutSelf';

function makeClient() {
  return ssbClient(manifest)
    .use(cachedAboutSelf())
    .use(hooksPlugin())
    .use(publishUtilsPlugin())
    .use(contactsPlugin())
    .use(connUtilsPlugin())
    .use(threadsUtilsPlugin())
    .callPromise();
}

type PromiseInnerType<P> = P extends Promise<infer T> ? T : never;

export type SSBClient = PromiseInnerType<ReturnType<typeof makeClient>>;

export default makeClient;
