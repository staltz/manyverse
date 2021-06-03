/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nodejs = require('nodejs-mobile-react-native');

export default {
  addListener(type: string, fn: CallableFunction) {
    nodejs.channel.addListener(type, fn);
  },

  removeListener(type: string, fn: CallableFunction) {
    nodejs.channel.removeListener(type, fn);
  },

  post(type: string, payload: string) {
    nodejs.channel.post(type, payload);
  },
};
