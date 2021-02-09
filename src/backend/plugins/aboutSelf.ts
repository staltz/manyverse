/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {About, FeedId, Msg} from 'ssb-typescript';
import {Callback} from './helpers/types';
const pull = require('pull-stream');
const cat = require('pull-cat');

interface GetOpts {
  id: FeedId;
  name?: boolean;
  image?: boolean;
  description?: boolean;
}

interface StreamOpts {
  id: FeedId;
  field: 'name' | 'image' | 'description';
}

type Output = {
  [k in keyof Omit<GetOpts, 'id'>]: string;
};

export = {
  name: 'aboutSelf',
  version: '1.0.0',
  manifest: {
    get: 'async',
    stream: 'source',
  },
  permissions: {
    master: {
      allow: ['get', 'stream'],
    },
  },
  init: function init(ssb: any) {
    const {
      and,
      live,
      about,
      author,
      descending,
      toPullStream,
    } = ssb.db.operators;

    function findName(msg: Msg<About>) {
      return msg.value.content.name;
    }

    function findImage(msg: Msg<any>) {
      const content = msg.value.content;
      if (!content.image) return;
      if (typeof content.image === 'string') return content.image;
      if (typeof content.image.link === 'string') return content.image.link;
    }

    function findDescr(msg: Msg<About>) {
      return msg.value.content.description;
    }

    return {
      get(opts: GetOpts, cb: Callback<Output>) {
        const out: Output = {};
        let answered = false;
        let remaining: number =
          (opts.name ? 1 : 0) +
          (opts.image ? 1 : 0) +
          (opts.description ? 1 : 0);
        let drainer: any;

        pull(
          ssb.db.query(
            and(
              about(opts.id),
              author(opts.id, {dedicated: opts.id === ssb.id}),
            ),
            descending(),
            toPullStream(),
          ),
          (drainer = pull.drain(
            (msg: Msg<About>) => {
              if (opts.name && !out.name && findName(msg)) {
                out.name = findName(msg);
                remaining--;
              }
              if (opts.image && !out.image && findImage(msg)) {
                out.image = findImage(msg);
                remaining--;
              }
              if (opts.description && !out.description && findDescr(msg)) {
                out.description = findDescr(msg);
                remaining--;
              }

              if (remaining <= 0) {
                drainer.abort();
                answered = true;
                cb(null, out);
              }
            },
            (err: any) => {
              if (err && err !== true) cb(err);
              else if (!answered) cb(null, out);
            },
          )),
        );
      },

      stream(opts: StreamOpts) {
        const findField = (msg: Msg<About | any>) =>
          opts.field === 'name'
            ? findName(msg)
            : opts.field === 'image'
            ? findImage(msg)
            : opts.field === 'description'
            ? findDescr(msg)
            : null;

        return cat([
          // First deliver latest field value
          pull(
            ssb.db.query(
              and(
                about(opts.id),
                author(opts.id, {dedicated: opts.id === ssb.id}),
              ),
              descending(),
              toPullStream(),
            ),
            pull.map(findField),
            pull.filter((x: any) => !!x),
            pull.take(1),
          ),

          // Then deliver live field values
          pull(
            ssb.db.query(
              and(
                about(opts.id),
                author(opts.id, {dedicated: opts.id === ssb.id}),
              ),
              live(),
              toPullStream(),
            ),
            pull.map(findField),
            pull.filter((x: any) => !!x),
          ),
        ]);
      },
    };
  },
};
