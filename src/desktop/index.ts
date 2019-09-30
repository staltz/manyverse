/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import makeClient from './ssb/client';
const pull = require('pull-stream');

function myapp() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = 'Frontend JS activated';

  makeClient().then(ssb => {
    pull(
      ssb.conn.peers(),
      pull.drain((peers: Array<any>) => {
        element.innerHTML =
          '<ul>' +
          peers
            .map(peer => peer[1].name || peer[1].key || '?')
            .map(name => `<li>${name}</li>`)
            .join('\n') +
          '</ul>';
      }),
    );

    pull(
      ssb.threads.public({
        threadMaxSize: 3,
        allowlist: ['post', 'contact'],
        reverse: true,
        live: false,
      }),
      pull.take(3),
      pull.drain((thread: any) => {
        console.warn(thread);
      }),
    );

    ssb.conn.start();
  });

  return element;
}

document.body.appendChild(myapp());
