// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Callback} from './helpers/types';

export = {
  name: 'connUtilsBack',
  version: '1.0.0',
  manifest: {
    persistentConnect: 'async',
    persistentDisconnect: 'async',
    isInDB: 'async',
  },
  permissions: {
    master: {
      allow: ['persistentConnect', 'persistentDisconnect', 'isInDB'],
    },
  },
  init: function init(ssb: any) {
    return {
      persistentConnect(address: string, data: any, cb: Callback<any>) {
        // if we had 'autoconnect=false', then make it true
        ssb.conn.db().update(address, (prev: any) => {
          if (!prev.autoconnect) return {autoconnect: true};
          else return {};
        });

        ssb.conn.connect(address, data, cb);
      },

      persistentDisconnect(address: string, cb: Callback<any>) {
        // if we had 'autoconnect=true', then make it false
        ssb.conn.db().update(address, (prev: any) => {
          if (prev.autoconnect) return {autoconnect: false};
          else return {};
        });

        // disconnect
        ssb.conn.disconnect(address, cb);
      },

      isInDB(address: string, cb: Callback<boolean>) {
        try {
          const result = ssb.conn.db().has(address);
          cb(null, result);
        } catch (err) {
          cb(err);
        }
      },
    };
  },
};
