/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Content, PostContent, AboutContent, FeedId} from 'ssb-typescript';
const ssbKeys = require('ssb-keys');
const Ref = require('ssb-ref');

type Callback = (e: any, x?: any) => void;

export = {
  name: 'feedUtilsBack',
  version: '1.0.0',
  manifest: {
    publish: 'async',
    publishAbout: 'async',
  },
  permissions: {
    master: {
      allow: ['publish', 'publishAbout'],
    },
  },
  init: function init(ssb: any) {
    if (!ssb.blobs?.push) {
      throw new Error('"feedUtilsBack" is missing required plugin "ssb-blobs"');
    }
    if (!ssb.blobsUtils?.addFromPath) {
      throw new Error(
        '"feedUtilsBack" is missing required plugin "blobsUtils"',
      );
    }

    return {
      publish(content: NonNullable<Content>, cb: Callback) {
        if ((content as PostContent).mentions) {
          for (const mention of (content as PostContent).mentions!) {
            if (Ref.isBlob(mention.link)) {
              ssb.blobs.push(mention.link, (err: any) => {
                if (err) console.error(err);
              });
            }
          }
        }
        if (content.recps) {
          try {
            content = ssbKeys.box(
              content,
              content.recps
                .map((e: FeedId | Record<string, any>) =>
                  Ref.isFeed(e) ? e : Ref.isFeed(e.link) ? e.link : void 0,
                )
                .filter(x => !!x),
            );
          } catch (e) {
            return cb(e);
          }
        }

        ssb.publish(content, (err: any, msg: any) => {
          if (err) console.error(err);
          if (cb) cb(err, msg);
        });
      },

      publishAbout(content: AboutContent, cb: Callback) {
        if (content.image && !Ref.isBlobId(content.image[0])) {
          ssb.blobsUtils.addFromPath(
            content.image,
            (err: any, hash: string) => {
              if (err) return console.error(err);
              content.image = hash;
              ssb.publish(content, (err2: any, msg: any) => {
                if (err2) console.error(err2);
                if (cb) cb(err2, msg);
              });
            },
          );
        } else {
          ssb.publish(content, (err: any, msg: any) => {
            if (err) console.error(err);
            if (cb) cb(err, msg);
          });
        }
      },
    };
  },
};
