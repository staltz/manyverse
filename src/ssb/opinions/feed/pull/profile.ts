/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nest = require('depnest');
const pull = require('pull-stream');

const feedProfileOpinion = {
  gives: nest('feed.pull.profile'),
  needs: nest('sbot.pull.userFeed', 'first'),
  create(api: any) {
    return nest('feed.pull.profile', (id: string) => {
      // handle last item passed in as lt
      return (opts: any) => {
        const moreOpts = {
          ...opts,
          id,
          lt: opts.lt && opts.lt.value ? opts.lt.value.sequence : opts.lt,
        };
        return pull(
          api.sbot.pull.userFeed(moreOpts),
          // pull.filter(msg => {
          //   return typeof msg.value.content !== 'string';
          // })
        );
      };
    });
  },
};

export default feedProfileOpinion;
