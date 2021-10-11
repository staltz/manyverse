// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
