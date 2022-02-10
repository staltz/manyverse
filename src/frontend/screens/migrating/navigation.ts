// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {navOptions as centralNavOpts} from '~frontend/screens/central';

export interface Actions {
  continue$: Stream<any>;
}

export default function navigation(actions: Actions): Stream<Command> {
  const goToCentral$ = actions.continue$.mapTo({
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

  return goToCentral$;
}
