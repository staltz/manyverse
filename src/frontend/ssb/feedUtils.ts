/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Content, AboutContent} from 'ssb-typescript';

const feedUtilsPlugin = {
  name: 'feedUtils',

  init: (ssb: any) => {
    return {
      publish(content: Content, cb: any) {
        ssb.hooks.publish({
          timestamp: Date.now(),
          value: {
            timestamp: Date.now(),
            author: ssb.id,
            content,
          },
        });

        ssb.feedUtilsBack.publish(content, cb);
      },

      publishAbout(content: AboutContent, cb: any) {
        ssb.feedUtilsBack.publishAbout(content, cb);
      },
    };
  },
};

export default () => feedUtilsPlugin;
