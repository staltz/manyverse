// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {Command, NavSource} from 'cycle-native-navigation';
import {navOptions as secretInputNavOpts} from '~frontend/screens/secret-input';
import {Screens} from '~frontend/screens/enums';
import {navOptions as centralNavOpts} from '~frontend/screens/central';
import {navOptions as migratingNavOpts} from '~frontend/screens/migrating/layout';
import {navOptions as resyncNavOpts} from '~frontend/screens/resync';

export interface Actions {
  createAccount$: Stream<any>;
  restoreAccount$: Stream<any>;
  migrateAccount$: Stream<any>;
  skipToCentral$: Stream<any>;
  skipToResync$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  navSource: NavSource,
): Stream<Command> {
  const goToCentral$ = xs
    .merge(actions.createAccount$, actions.skipToCentral$)
    .mapTo({
      type: 'setStackRoot',
      layout: {
        sideMenu: {
          left: {
            component: {name: Screens.Drawer},
          },
          center: {
            stack: {
              id: 'mainstack',
              children: [
                {
                  component: {
                    name: Screens.Central,
                    options: centralNavOpts,
                  },
                },
              ],
            },
          },
        },
      },
    } as Command);

  const goToResync$ = actions.skipToResync$
    .compose(delay(100))
    .endWhen(navSource.globalDidAppear(Screens.Resync))
    .mapTo({
      type: 'push',
      layout: {
        component: {
          name: Screens.Resync,
          options: resyncNavOpts,
        },
      },
    } as Command);

  const goToMigrating$ = actions.migrateAccount$.mapTo({
    type: 'push',
    layout: {
      component: {
        name: Screens.Migrating,
        options: migratingNavOpts,
      },
    },
  } as Command);

  const goToSecretInput$ = actions.restoreAccount$.mapTo({
    type: 'push',
    layout: {
      component: {
        name: Screens.SecretInput,
        passProps: {
          practiceMode: false,
        },
        options: secretInputNavOpts,
      },
    },
  } as Command);

  return xs.merge(goToCentral$, goToResync$, goToMigrating$, goToSecretInput$);
}
