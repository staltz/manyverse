/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, PushCommand} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '../profile';
import {navOptions as rawDatabaseScreenNavOptions} from '../raw-db';
import {navOptions as backupScreenNavOptions} from '../backup';
import {State} from './model';
import {Screens} from '../..';

export type Actions = {
  goToSelfProfile$: Stream<null>;
  goToBackup$: Stream<null>;
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

  const toBackup$ = actions.goToBackup$.map(
    () =>
      ({
        type: 'showOverlay',
        layout: {
          component: {
            name: Screens.Backup,
            options: backupScreenNavOptions,
          },
        },
      } as Command),
  );

  const hideDrawerAndPush$ = xs
    .merge(toSelfProfile$, toRawDatabase$, toBackup$)
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
