// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {navOptions as connectionsScreenNavOpts} from '../../connections-advanced/layout';
import {Props as ConnAdvancedProps} from '../../connections-advanced/props';
import {State} from './model';

export interface Actions {
  goToConnectionsAdvanced$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toConnectionsAdvanced$ = actions.goToConnectionsAdvanced$
    .compose(sample(state$))
    .map(
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.ConnectionsAdvanced,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                peers: state.peers,
                rooms: state.rooms,
                stagedPeers: state.stagedPeers,
              } as ConnAdvancedProps,
              options: connectionsScreenNavOpts,
            },
          },
        } as Command),
    );

  return toConnectionsAdvanced$;
}
