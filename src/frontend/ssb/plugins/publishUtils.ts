// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Content, AboutContent} from 'ssb-typescript';
import {ClientAPI, AnyFunction} from 'react-native-ssb-client';
import manifest from '../manifest';

type SSB = ClientAPI<
  typeof manifest & {
    hooks: {
      publish: AnyFunction;
    };
  }
>;

const noop = () => {};

const publishUtilsPlugin = {
  name: 'publishUtils' as const,

  init: (ssb: SSB) => {
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

        // TODO: temporary hack until we fix issue #1256 properly
        setTimeout(() => {
          ssb.publishUtilsBack.publish(content, cb || noop);
        }, 60);
      },

      publishAbout(content: AboutContent, cb: any) {
        ssb.publishUtilsBack.publishAbout(content, cb);
      },
    };
  },
};

export default () => publishUtilsPlugin;
