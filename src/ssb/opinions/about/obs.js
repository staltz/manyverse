/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var {Value, computed} = require('mutant');
var pull = require('pull-stream');
var nest = require('depnest');
var ref = require('ssb-ref');
var colorHash = new (require('color-hash'))();

exports.needs = nest({
  'sbot.pull.stream': 'first',
  'sbot.pull.aboutLatestValueStream': 'first',
  'blob.sync.url': 'first',
  'about.sync.shortFeedId': 'first',
  'keys.sync.id': 'first',
});

exports.gives = nest({
  'about.obs': ['name', 'description', 'image', 'imageUrl', 'color'],
});

exports.create = function(api) {
  return nest({
    'about.obs': {
      name: id => socialValue(id, 'name', api.about.sync.shortFeedId(id)),
      description: id => socialValue(id, 'description'),
      image: id => socialValue(id, 'image'),
      imageUrl: id =>
        computed(socialValue(id, 'image'), blobId => {
          return blobId ? api.blob.sync.url(blobId) : null;
        }),
      color: id => computed(id, id => colorHash.hex(id)),
    },
  });

  function socialValue(id, key, defaultValue) {
    if (!ref.isLink(id)) throw new Error('About requires an ssb ref!');
    const value = Value(defaultValue);
    pull(
      api.sbot.pull.aboutLatestValueStream({key, dest: id}),
      pull.drain(v => {
        value.set(v);
      }),
    );
    return value;
  }
};
