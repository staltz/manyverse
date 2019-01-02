/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';

export type Actions = {
  openDrawer$: Stream<null>;
};

export default function navigationCommands(
  actions: Actions,
  other$: Stream<Command>,
): Stream<Command> {
  const openDrawer$: Stream<Command> = actions.openDrawer$.map(
    () =>
      ({
        type: 'mergeOptions',
        opts: {
          sideMenu: {
            left: {
              visible: true,
            },
          },
        },
      } as Command),
  );

  return xs.merge(openDrawer$, other$);
}
