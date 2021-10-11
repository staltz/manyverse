// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId, Msg} from 'ssb-typescript';

export = {
  name: 'resyncUtils',
  version: '1.0.0',
  manifest: {},
  permissions: {
    master: {
      allow: [],
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

      // Re-enable firewall when our first msg is detected
      let unsubscribeDB = ssb.post((msg: Msg) => {
        if (msg.value.author === ssb.id) {
          ssb.connFirewall.reconfigure({
            rejectUnknown: config.conn?.firewall?.rejectUnknown ?? true,
          });
          unsubscribeDB?.();
          unsubscribeDB = null;
        }
      }, false);
    });
  },
};
