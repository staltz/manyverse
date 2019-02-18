/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Req, StagedPeerMetadata} from '../../../drivers/ssb';
import {NetworkSource} from '../../../drivers/network';

export type Actions = {
  removeDhtInvite$: Stream<string>;
  bluetoothSearch$: Stream<any>;
  openStagedPeer$: Stream<StagedPeerMetadata>;
  pingConnectivityModes$: Stream<any>;
};

export default function ssb(actions: Actions, networkSource: NetworkSource) {
  return xs.merge(
    actions.removeDhtInvite$.map(
      invite => ({type: 'dhtInvite.remove', invite} as Req),
    ),
    actions.pingConnectivityModes$
      .map(() => networkSource.bluetoothIsEnabled())
      .flatten()
      .map(
        bluetoothEnabled =>
          (bluetoothEnabled
            ? {type: 'bluetooth.enable'}
            : {type: 'bluetooth.disable'}) as Req,
      ),
    actions.bluetoothSearch$.mapTo(
      {type: 'bluetooth.search', interval: 20e3} as Req,
    ),
    actions.openStagedPeer$
      .filter(peer => peer.source === 'bt')
      .map(peer => ({type: 'bluetooth.connect', address: peer.key} as Req)),
  );
}
