/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, PushCommand} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '../profile';
import {navOptions as rawDatabaseScreenNavOptions} from '../raw-db';
import {State} from './model';
import {Screens} from '../..';

export type Actions = {
  goToSelfProfile$: Stream<null>;
  showRawDatabase$: Stream<null>;
};

export default function navigationCommands(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toSelfProfile$ = actions.goToSelfProfile$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              feedId: state.selfFeedId,
            },
            options: profileScreenNavOptions,
          },
        },
      } as PushCommand),
  );

  const toRawDatabase$ = actions.showRawDatabase$.map(
    () =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.RawDatabase,
            options: rawDatabaseScreenNavOptions,
          },
        },
      } as PushCommand),
  );

  const hideDrawerAndPush$ = xs
    .merge(toSelfProfile$, toRawDatabase$)
    .map(pushCommand => {
      const hideDrawer: Command = {
        type: 'mergeOptions',
        opts: {
          sideMenu: {
            left: {
              visible: false,
            },
          },
        },
      };

      return xs.of<Command>(hideDrawer, pushCommand);
    })
    .flatten();

  return hideDrawerAndPush$;
}
