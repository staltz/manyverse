// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {navOptions as centralNavOpts} from '~frontend/screens/central';
import {navOptions as pasteInviteNavOpts} from '~frontend/screens/invite-paste';

export interface Actions {
  goToPasteInvite$: Stream<any>;
  goToCentral$: Stream<any>;
}

export default function navigation(actions: Actions): Stream<Command> {
  const toCentral$ = actions.goToCentral$.map(
    () =>
      ({
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
      } as Command),
  );

  const toPasteInvite$ = actions.goToPasteInvite$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.InvitePaste,
            options: pasteInviteNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(toCentral$, toPasteInvite$);
}
