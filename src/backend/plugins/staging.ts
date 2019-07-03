/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pull = require('pull-stream');

type BTPeer = {remoteAddress: string; id: string; displayName: string};

export = {
  name: 'staging',
  version: '1.0.0',
  manifest: {},
  permissions: {},
  init(ssb: any) {
    if (!ssb.bluetooth) {
      console.error('Manyverse staging plugin requires ssb-bluetooth plugin');
      return;
    }
    if (!ssb.conn) {
      console.error('Manyverse staging plugin requires ssb-conn plugin');
      return;
    }
    if (!ssb.dhtInvite) {
      console.error('Manyverse staging plugin requires ssb-dht-invite plugin');
      return;
    }

    pull(
      ssb.dhtInvite.claimingInvites(),
      pull.drain((invite: any) => {
        console.log('claiming ' + invite);
        // ssb.conn.stage()
        // ({
        //   key: invite,
        //   source: 'dht',
        //   role: 'client',
        // } as StagedPeerMetadata),
      }),
    );

    pull(
      ssb.bluetooth.nearbyScuttlebuttDevices(1000),
      pull.drain(({discovered}: {discovered: Array<BTPeer>}) => {
        for (const btPeer of discovered) {
          const address =
            `bt:${btPeer.remoteAddress.split(':').join('')}` +
            '~' +
            `shs:${btPeer.id.replace(/^\@/, '').replace(/\.ed25519$/, '')}`;
          ssb.conn.stage(address, {type: 'bt', note: btPeer.displayName});

          // TODO after some seconds or minutes, unstage each one
        }
      }),
    );
  },
};
