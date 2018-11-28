/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var nest = require('depnest');
var {Value} = require('mutant');

exports.needs = nest({
  'sbot.async.isFollowing': 'first',
  'sbot.async.isBlocking': 'first',
});

exports.gives = nest({
  'contact.obs.tristate': true,
  'sbot.hook.publish': true,
});

exports.create = function(api) {
  var mutantValues = {};

  return nest({
    'contact.obs': {
      tristate: (source, dest) => {
        updateTristateAsync(source, dest);
        return getMutantValue(source, dest);
      },
    },
    'sbot.hook.publish': function(msg) {
      if (!isContact(msg)) return;
      var source = msg.value.author;
      var dest = msg.value.content.contact;
      var tristate = msg.value.content.following // from ssb-friends
        ? true
        : msg.value.content.flagged || msg.value.content.blocking
          ? false
          : null;
      getMutantValue(source, dest).set(tristate);
    },
  });

  function updateTristateAsync(source, dest) {
    const value = getMutantValue(source, dest);
    api.sbot.async.isFollowing({source, dest}, (err, isFollowing) => {
      if (err) console.error(err);
      if (isFollowing) value.set(true);
    });
    api.sbot.async.isBlocking({source, dest}, (err, isBlocking) => {
      if (err) console.error(err);
      if (isBlocking) value.set(false);
    });
  }

  function getMutantValue(source, dest) {
    mutantValues[source] = mutantValues[source] || {};
    mutantValues[source][dest] = mutantValues[source][dest] || Value(null);
    return mutantValues[source][dest];
  }
};

function isContact(msg) {
  return msg.value && msg.value.content && msg.value.content.type === 'contact';
}
