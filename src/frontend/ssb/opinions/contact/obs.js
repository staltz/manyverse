/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import xs from 'xstream';
var nest = require('depnest');

exports.needs = nest({
  'sbot.async.isFollowing': 'first',
  'sbot.async.isBlocking': 'first',
  'sbot.async.ssb': 'first',
});

exports.gives = nest({
  'contact.obs.tristate': true,
});

exports.create = function(api) {
  var streams = {};
  function getStream(source, dest) {
    streams[source] = streams[source] || {};
    if (!streams[source][dest]) {
      streams[source][dest] = xs.createWithMemory();
      streams[source][dest].shamefullySendNext(null);
    }
    return streams[source][dest];
  }

  function updateTristateAsync(source, dest) {
    const stream = getStream(source, dest);
    api.sbot.async.isFollowing({source, dest}, (err, isFollowing) => {
      if (err) console.error(err);
      if (isFollowing) stream.shamefullySendNext(true);
    });
    api.sbot.async.isBlocking({source, dest}, (err, isBlocking) => {
      if (err) console.error(err);
      if (isBlocking) stream.shamefullySendNext(false);
    });
  }

  api.sbot.async.ssb((err, sbot) => {
    if (err) return;
    sbot.hooks.publishStream().addListener({
      next: msg => {
        if (!isContact(msg)) return;
        var source = msg.value.author;
        var dest = msg.value.content.contact;
        var tristate = msg.value.content.following // from ssb-friends
          ? true
          : msg.value.content.flagged || msg.value.content.blocking
          ? false
          : null;
        getStream(source, dest).shamefullySendNext(tristate);
      },
    });
  });

  return nest({
    'contact.obs': {
      tristate: (source, dest) => {
        updateTristateAsync(source, dest);
        return getStream(source, dest);
      },
    },
  });
};

function isContact(msg) {
  return msg.value && msg.value.content && msg.value.content.type === 'contact';
}
