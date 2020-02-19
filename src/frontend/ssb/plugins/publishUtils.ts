/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Content, AboutContent} from 'ssb-typescript';

const noop = () => {};

const publishUtilsPlugin = {
  name: 'publishUtils',

  init: (ssb: any) => {
    return {
      publish(content: Content, cb?: any) {
        ssb.hooks.publish({
          timestamp: Date.now(),
          value: {
            timestamp: Date.now(),
            author: ssb.id,
            content,
          },
        });

        ssb.publishUtilsBack.publish(content, cb || noop);
      },

      publishAbout(content: AboutContent, cb: any) {
        ssb.publishUtilsBack.publishAbout(content, cb);
      },
    };
  },
};

export default () => publishUtilsPlugin;
