/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
var pull = require('pull-stream');
var nest = require('depnest');
var ref = require('ssb-ref');

exports.needs = nest({
  'sbot.pull.backlinks': 'first',
});

exports.gives = nest({
  'message.obs.likes': true,
});

exports.create = function(api) {
  return nest({
    'message.obs.likes': id => {
      if (!ref.isLink(id)) throw new Error('an id must be specified');
      return xs.createWithMemory({
        start(listener) {
          listener.next([]);
          this.theSet = new Set();
          this.sink = pull.drain(msg => {
            if (!msg || msg.sync) return;
            if (!msg || !msg.value || !msg.value.content) return;
            if (msg.value.content.type !== 'vote') return;
            if (!msg.value.content.vote) return;
            const author = msg.value.author;
            if (msg.value.content.vote.value < 1) this.theSet.delete(author);
            else this.theSet.add(author);
            listener.next([...this.theSet]);
          });
          pull(
            api.sbot.pull.backlinks({
              query: [{$filter: {dest: id}}],
              index: 'DTA',
              live: true,
            }),
            this.sink,
          );
        },
        stop() {
          if (this.sink) this.sink.abort(true);
        },
      });
    },
  });
};
