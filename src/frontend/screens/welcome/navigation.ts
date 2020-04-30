/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import {navOptions as secretInputNavOpts} from '../secret-input';
import {Screens} from '../enums';
import {navOptions as centralNavOpts} from '../central';

export type Actions = {
  createAccount$: Stream<any>;
  restoreAccount$: Stream<any>;
  skipOrNot$: Stream<boolean>;
};

export default function navigation(actions: Actions): Stream<Command> {
  const skipWelcome$ = actions.skipOrNot$.filter(skip => skip === true);

  const goToCentral$ = xs.merge(actions.createAccount$, skipWelcome$).mapTo({
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

  return xs.merge(goToCentral$, goToSecretInput$);
}
