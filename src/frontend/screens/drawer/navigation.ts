/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, PushCommand} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '../profile';
import {Props as ProfileProps} from '../profile/props';
import {navOptions as rawDatabaseScreenNavOptions} from '../raw-db';
import {navOptions as settingsScreenNavOptions} from '../settings';
import {State} from './model';
import {Screens} from '../enums';

export type Actions = {
  goToSelfProfile$: Stream<null>;
  goToSettings$: Stream<any>;
  showRawDatabase$: Stream<null>;
};

export default function navigationCommands(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toSelfProfile$ = actions.goToSelfProfile$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              feedId: state.selfFeedId,
            } as ProfileProps,
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

  const toSettings$ = actions.goToSettings$.map(
    () =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Settings,
            options: settingsScreenNavOptions,
          },
        },
      } as PushCommand),
  );

  const hideDrawerAndPush$ = xs
    .merge(toSelfProfile$, toRawDatabase$, toSettings$)
    .map((pushCommand) => {
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
