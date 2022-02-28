// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId} from 'ssb-typescript';
import {Callback} from './helpers/types';

export = {
  name: 'resyncUtils',
  version: '1.0.0',
  manifest: {
    progress: 'source',
    enableFirewall: 'sync',
  },
  permissions: {
    master: {
      allow: ['progress', 'enableFirewall'],
    },
  },
  init(ssb: any, config: any) {
    // Disable conn firewall to allow "strangers" to connect and resync data
    ssb.getVectorClock((err: any, clock: Record<FeedId, number>) => {
      if (err) return console.error('resyncUtils exception', err);
      if (!clock) return console.error('resyncUtils missing clock', clock);
      if (clock[ssb.id]) return; // we are not resyncing, apparently

      // Our feed is empty, so temporarily disable firewall for strangers
      ssb.connFirewall.reconfigure({rejectUnknown: false});
    });

    return {
      progress() {
        return function progressSource(errOrEnd: any, cb: Callback<number>) {
          if (errOrEnd) return cb(errOrEnd);
          const timeout = setTimeout(() => {
            const stats = ssb.db.getStatus().value;
            cb(null, stats.log);
          }, 500) as any as NodeJS.Timeout;
          timeout.unref();
        };
      },

      enableFirewall() {
        ssb.connFirewall.reconfigure({
          rejectUnknown: config.conn?.firewall?.rejectUnknown ?? true,
        });
      },
    };
  },
};
