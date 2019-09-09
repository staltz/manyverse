/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {Msg} from 'ssb-typescript';
import ssbClient from 'react-native-ssb-client';
import cachedAbout from 'ssb-cached-about';
import {ssbKeysPath} from './defaults';
import manifest from './manifest';
import feedUtilsPlugin from './feedUtils';
import contactsPlugin from './contacts';
import syncingNotifications from './syncing-notifications';

const hooksPlugin = {
  name: 'hooks',
  init: () => {
    const stream = xs.create<Msg>();
    return {
      publish: (msg: Msg) => {
        stream.shamefullySendNext(msg);
      },
      publishStream: () => stream,
    };
  },
};

function makeClient() {
  return ssbClient(ssbKeysPath, manifest)
    .use(hooksPlugin)
    .use(feedUtilsPlugin())
    .use(cachedAbout())
    .use(contactsPlugin())
    .use(syncingNotifications())
    .callPromise();
}

export default makeClient;
