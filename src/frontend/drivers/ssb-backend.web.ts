// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
