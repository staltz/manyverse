// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {navOptions as connectionsScreenNavOpts} from '../../connections-panel/layout';
import {Props as ConnPanelProps} from '../../connections-panel/props';
import {State} from './model';

export interface Actions {
  goToConnectionsPanel$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toConnectionsPanel$ = actions.goToConnectionsPanel$
    .compose(sample(state$))
    .map(
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.ConnectionsPanel,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                peers: state.peers,
                rooms: state.rooms,
                stagedPeers: state.stagedPeers,
              } as ConnPanelProps,
              options: connectionsScreenNavOpts,
            },
          },
        } as Command),
    );

  return toConnectionsPanel$;
}
