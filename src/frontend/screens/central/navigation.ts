/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../enums';
import {navOptions as searchNavOpts} from '../search/index';
import {Props as SearchProps} from '../search/props';
import {State} from './model';

export type Actions = {
  openDrawer$: Stream<null>;
  closeDrawer$: Stream<null>;
  goToSearch$: Stream<null>;
};

export default function navigationCommands(
  state$: Stream<State>,
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

  const closeDrawer$: Stream<Command> = actions.closeDrawer$.map(
    () =>
      ({
        type: 'mergeOptions',
        opts: {
          sideMenu: {
            left: {
              visible: false,
            },
          },
        },
      } as Command),
  );

  const toSearch$ = actions.goToSearch$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Search,
            options: searchNavOpts,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              lastSessionTimestamp: state.lastSessionTimestamp,
            } as SearchProps,
          },
        },
      } as Command),
  );

  return xs.merge(openDrawer$, closeDrawer$, toSearch$, other$);
}
