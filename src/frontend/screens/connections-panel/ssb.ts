// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Req} from '~frontend/drivers/ssb';
import {StagedPeerKV} from '~frontend/ssb/types';

export interface Actions {
  connectPeer$: Stream<StagedPeerKV>;
  disconnectPeer$: Stream<string>;
  disconnectForgetPeer$: Stream<string>;
  forgetPeer$: Stream<string>;
}

export default function ssb(actions: Actions) {
  return xs.merge(
    actions.connectPeer$.map(
      (peer) =>
        ({
          type: 'conn.connect',
          address: peer[0],
          hubData: {type: peer[1].type},
        } as Req),
    ),
    actions.disconnectPeer$.map(
      (address) => ({type: 'conn.disconnect', address} as Req),
    ),
    actions.disconnectForgetPeer$.map(
      (address) => ({type: 'conn.disconnectForget', address} as Req),
    ),
    actions.forgetPeer$.map(
      (address) => ({type: 'conn.forget', address} as Req),
    ),
  );
}
