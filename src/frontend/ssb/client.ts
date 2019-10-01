/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ssbClient from 'react-native-ssb-client';
import cachedAbout from 'ssb-cached-about';
import manifest from './manifest';
import hooksPlugin from './plugins/hooks';
import feedUtilsPlugin from './plugins/feedUtils';
import contactsPlugin from './plugins/contacts';
import syncingNotifications from './plugins/syncing-notifications';

function makeClient() {
  return ssbClient(manifest)
    .use(hooksPlugin())
    .use(feedUtilsPlugin())
    .use(cachedAbout())
    .use(contactsPlugin())
    .use(syncingNotifications())
    .callPromise();
}

export default makeClient;
