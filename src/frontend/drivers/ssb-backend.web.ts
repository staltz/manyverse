/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {ipcRenderer} = require('electron');

const wrappers = new Map<CallableFunction, CallableFunction>();

export default {
  addListener(type: string, fn: CallableFunction) {
    const wrapper = (first: any, second: any) => {
      const msg = second ?? first;
      fn(msg);
    };
    wrappers.set(fn, wrapper);
    ipcRenderer.addListener(type, wrapper);
  },

  removeListener(type: string, fn: CallableFunction) {
    const wrapper = wrappers.get(fn);
    if (wrapper) {
      ipcRenderer.removeListener(type, wrapper);
      wrappers.delete(fn);
    }
  },

  post(type: string, payload: string) {
    ipcRenderer.send(type, payload);
  },
};
