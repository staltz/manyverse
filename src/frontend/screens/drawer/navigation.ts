// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, PushCommand} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '~frontend/screens/profile';
import {Props as ProfileProps} from '~frontend/screens/profile/props';
import {navOptions as rawDatabaseScreenNavOptions} from '~frontend/screens/raw-db';
import {navOptions as settingsScreenNavOptions} from '~frontend/screens/settings';

import {Screens} from '~frontend/screens/enums';
import {State} from './model';

export interface Actions {
  goToSelfProfile$: Stream<null>;
  goToSettings$: Stream<any>;
  goToStorage$: Stream<null>;
  showRawDatabase$: Stream<null>;
}

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

  const toSettings$ = actions.goToSettings$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Settings,
            options: settingsScreenNavOptions,
            passProps: {
              selfFeedId: state.selfFeedId,
            },
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
