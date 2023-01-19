// SPDX-FileCopyrightText: 2022-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
const Ref = require('ssb-ref');
import {Req} from '~frontend/drivers/ssb';
import {State} from './model';

interface Actions {
  willGoToCentral$: Stream<any>;
  deleteAccount$: Stream<any>;
}

export default function ssb(actions: Actions, state$: Stream<State>) {
  const useIdentity$ = xs.of<Req>({type: 'identity.use'});

  // Startup ssb-conn and replicate myself
  const ebtRequest$ = state$
    .filter((state) => Ref.isFeedId(state.selfFeedId))
    .take(1)
    .map((state) =>
      xs.of<Req>(
        {
          type: 'conn.start',
        },
        {
          type: 'ebt.request',
          id: state.selfFeedId,
          requesting: true,
        },
      ),
    )
    .flatten();

  // Connect to any staged peer as soon as possible, at most MAX_CONNECTIONS
  const MAX_CONNECTIONS = 6;
  const connectToAnyStagedPeer$ = state$
    .filter((state) => {
      const connectedPeers = state.peers.filter(
        (p) => p[1].state === 'connected',
      );
      return connectedPeers.length < MAX_CONNECTIONS;
    })
    .map((state) => {
      const stagedPeers = state.stagedPeers
        .filter(([addr, data]) => data.type !== ('room' as any))
        .slice(0, MAX_CONNECTIONS);
      return xs.fromArray(stagedPeers);
    })
    .flatten()
    .map(
      ([addr, data]) =>
        ({
          type: 'conn.connect',
          hubData: data,
          address: addr,
        } as Req),
    );

  // Re-enable the firewall and reboot ssb-conn when we're done
  const enableFirewall$ = actions.willGoToCentral$
    .map(() =>
      xs.of<Req>({type: 'resyncUtils.enableFirewall'}, {type: 'connReboot'}),
    )
    .flatten();

  const nuke$ = actions.deleteAccount$
    .mapTo({type: 'nuke'} as Req)
    .filter((x) => x !== null);

  return xs.merge(
    useIdentity$,
    ebtRequest$,
    connectToAnyStagedPeer$,
    enableFirewall$,
    nuke$,
  );
}
